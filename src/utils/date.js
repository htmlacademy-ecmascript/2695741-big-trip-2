import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const MINUTES_IN_DAY = MINUTES_IN_HOUR * HOURS_IN_DAY;
const DURATION_PART_LENGTH = 2;

const formatDate = (date, format) => dayjs.utc(date).format(format);
const toPickerDate = (date) => new Date(formatDate(date, 'YYYY-MM-DDTHH:mm:ss.SSS'));
const fromPickerDate = (date) => dayjs(date).utc(true).toISOString();

const formatDuration = (from, to) => {
  const minutes = dayjs(to).diff(dayjs(from), 'minute');
  const days = Math.floor(minutes / MINUTES_IN_DAY);
  const hours = Math.floor(minutes / MINUTES_IN_HOUR) % HOURS_IN_DAY;
  const remainder = minutes % MINUTES_IN_HOUR;
  const pad = (value) => String(value).padStart(DURATION_PART_LENGTH, '0');

  if (days) {
    return `${pad(days)}D ${pad(hours)}H ${pad(remainder)}M`;
  }

  if (hours) {
    return `${pad(hours)}H ${pad(remainder)}M`;
  }

  return `${pad(remainder)}M`;
};

export {formatDate, formatDuration, toPickerDate, fromPickerDate};
