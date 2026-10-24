import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const formatDate = (date, format) => dayjs.utc(date).format(format);
const toPickerDate = (date) => new Date(formatDate(date, 'YYYY-MM-DDTHH:mm:ss.SSS'));
const fromPickerDate = (date) => dayjs(date).utc(true).toISOString();

const formatDuration = (from, to) => {
  const minutes = dayjs(to).diff(dayjs(from), 'minute');
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor(minutes / 60) % 24;
  const remainder = minutes % 60;
  const pad = (value) => String(value).padStart(2, '0');

  if (days) {
    return `${pad(days)}D ${pad(hours)}H ${pad(remainder)}M`;
  }

  if (hours) {
    return `${pad(hours)}H ${pad(remainder)}M`;
  }

  return `${pad(remainder)}M`;
};

export {formatDate, formatDuration, toPickerDate, fromPickerDate};
