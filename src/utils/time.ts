const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function dateOrdinal(date: number) {
  if (date > 3 && date < 21) {
    return 'th';
  }
  switch (date % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function dateFromTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  let dateString = `${monthNames[date.getMonth()]} ${date.getDate()}${dateOrdinal(date.getDate())}`;

  if (date.getFullYear() !== new Date().getFullYear()) {
    dateString += `, ${date.getFullYear()}`;
  }

  return dateString;
}

export function timeSinceTimestamp(timestamp: number) {
  var seconds = Math.floor((Date.now() - timestamp) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  interval = seconds / 60;
  return Math.floor(Math.max(interval, 1)) + ' mins ago';
}

export function timestampToDate(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  const weekAgo = new Date();

  weekAgo.setDate(weekAgo.getDate() - 7);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else if (date.getTime() > weekAgo.getTime()) {
    return date.toLocaleDateString([], { weekday: 'long' }).split(',')[0];
  } else {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(
      date.getDate() + 1
    )
      .toString()
      .padStart(2, '0')}`;
  }
}
