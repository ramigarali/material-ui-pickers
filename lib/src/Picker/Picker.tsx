import * as React from 'react';
import clsx from 'clsx';
import { WrapperVariant } from '../wrappers/Wrapper';
import { useViews } from '../_shared/hooks/useViews';
import { makeStyles } from '@material-ui/core/styles';
import { DateTimePickerView } from '../DateTimePicker';
import { WithViewsProps } from './makePickerWithState';
import { BasePickerProps } from '../typings/BasePicker';
import { MaterialUiPickersDate } from '../typings/date';
import { DateInputProps } from '../_shared/PureDateInput';
import { CalendarView } from '../views/Calendar/CalendarView';
import { useIsLandscape } from '../_shared/hooks/useIsLandscape';
import { DIALOG_WIDTH, VIEW_HEIGHT } from '../constants/dimensions';
import { WrapperVariantContext } from '../wrappers/WrapperVariantContext';
import { MobileKeyboardInputView } from '../views/MobileKeyboardInputView';
import { ClockView, ExportedClockViewProps } from '../views/Clock/ClockView';
import { BaseDatePickerProps, DatePickerView } from '../DatePicker/DatePicker';

export type PickerView = DateTimePickerView;

export type ToolbarComponentProps<T extends PickerView = any> = BaseDatePickerProps &
  ExportedClockViewProps & {
    views: T[];
    openView: T;
    date: MaterialUiPickersDate;
    setOpenView: (view: T) => void;
    onChange: (date: MaterialUiPickersDate, isFinish?: boolean) => void;
    toolbarTitle?: string;
    // TODO move out, cause it is DateTimePickerOnly
    hideTabs?: boolean;
    dateRangeIcon?: React.ReactNode;
    timeIcon?: React.ReactNode;
    isLandscape: boolean;
    ampmInClock?: boolean;
    isMobileKeyboardViewOpen: boolean;
    toggleMobileKeyboardView: () => void;
    getMobileKeyboardInputViewButtonText?: () => string;
  };

export interface PickerViewProps<TView extends PickerView>
  extends Omit<BasePickerProps, 'value' | 'onChange'>,
    WithViewsProps<TView>,
    BaseDatePickerProps,
    ExportedClockViewProps {
  toolbarTitle?: string;
  showToolbar?: boolean;
  ToolbarComponent: React.ComponentType<ToolbarComponentProps<any>>;
  // TODO move out, cause it is DateTimePickerOnly
  hideTabs?: boolean;
  dateRangeIcon?: React.ReactNode;
  timeIcon?: React.ReactNode;
}

interface PickerProps<T extends PickerView> extends PickerViewProps<T> {
  isMobileKeyboardViewOpen: boolean;
  toggleMobileKeyboardView: () => void;
  DateInputProps: DateInputProps;
  date: MaterialUiPickersDate;
  onDateChange: (
    date: MaterialUiPickersDate,
    currentVariant: WrapperVariant,
    isFinish?: boolean | symbol
  ) => void;
}

export const useStyles = makeStyles(
  {
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    containerLandscape: {
      flexDirection: 'row',
    },
    pickerView: {
      overflowX: 'hidden',
      width: DIALOG_WIDTH,
      maxHeight: VIEW_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
    },
    pickerViewLandscape: {
      padding: '0 8px',
    },
  },
  { name: 'MuiPickersBasePicker' }
);

const isTimePickerByViews = (views: DateTimePickerView[]) =>
  !views.some(view => view === 'year' || view === 'month' || view === 'date');

export function Picker({
  date,
  openTo = 'date',
  views = ['year', 'month', 'date', 'hours', 'minutes', 'seconds'],
  toolbarTitle,
  showToolbar,
  onDateChange,
  ToolbarComponent,
  orientation,
  DateInputProps,
  isMobileKeyboardViewOpen,
  toggleMobileKeyboardView,
  ...other
}: PickerProps<PickerView>) {
  const classes = useStyles();
  const isLandscape = useIsLandscape(views, orientation);
  const wrapperVariant = React.useContext(WrapperVariantContext);
  const onChange = React.useCallback(
    (date: MaterialUiPickersDate, isFinish?: boolean | symbol) => {
      onDateChange(date, wrapperVariant, isFinish);
    },
    [onDateChange, wrapperVariant]
  );

  const toShowToolbar =
    typeof showToolbar === 'undefined' ? wrapperVariant !== 'desktop' : showToolbar;

  const { openView, nextView, previousView, setOpenView, handleChangeAndOpenNext } = useViews({
    views,
    openTo,
    onChange,
    isMobileKeyboardViewOpen,
    toggleMobileKeyboardView,
  });

  return (
    <div
      className={clsx(classes.container, {
        [classes.containerLandscape]: isLandscape,
      })}
    >
      {toShowToolbar && (
        <ToolbarComponent
          {...other}
          views={views}
          isLandscape={isLandscape}
          date={date}
          onChange={onChange}
          setOpenView={setOpenView}
          openView={openView}
          toolbarTitle={toolbarTitle}
          ampmInClock={other.ampmInClock}
          isMobileKeyboardViewOpen={isMobileKeyboardViewOpen}
          toggleMobileKeyboardView={toggleMobileKeyboardView}
        />
      )}

      <div
        className={clsx(classes.pickerView, {
          [classes.pickerViewLandscape]: isLandscape,
        })}
      >
        {isMobileKeyboardViewOpen ? (
          <MobileKeyboardInputView {...DateInputProps} />
        ) : (
          <>
            {(openView === 'year' || openView === 'month' || openView === 'date') && (
              <CalendarView
                date={date}
                changeView={setOpenView}
                // @ts-ignore
                views={views}
                onChange={handleChangeAndOpenNext}
                view={openView as DatePickerView}
                {...other}
              />
            )}

            {(openView === 'hours' || openView === 'minutes' || openView === 'seconds') && (
              <ClockView
                {...other}
                date={date}
                type={openView as 'hours' | 'minutes' | 'seconds'}
                onDateChange={onChange}
                onChange={handleChangeAndOpenNext}
                openNextView={() => setOpenView(nextView)}
                openPreviousView={() => setOpenView(previousView)}
                nextViewAvailable={!Boolean(nextView)}
                previousViewAvailable={!Boolean(previousView)}
                showViewSwitcher={isTimePickerByViews(views) && wrapperVariant === 'desktop'}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

Picker.displayName = 'Picker';
