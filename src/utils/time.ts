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
