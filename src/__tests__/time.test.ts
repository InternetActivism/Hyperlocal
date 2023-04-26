import { timestampToDate } from '../utils/time';

describe('timestampToDate', () => {
  const date = new Date('2023-02-03');
  const today = new Date();
  const yesterday = new Date();
  const coupleDaysAgo = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  coupleDaysAgo.setDate(coupleDaysAgo.getDate() - 3);

  it('should return the date in the format YYYY-MM-DD', () => {
    expect(timestampToDate(date.getTime())).toBe('2023-02-03');
  });

  it('should return "Yesterday" if the date is yesterday', () => {
    expect(timestampToDate(yesterday.getTime())).toBe('Yesterday');
  });

  it('should return the day of the week if the date is in the past week', () => {
    expect(timestampToDate(coupleDaysAgo.getTime())).toBe(
      coupleDaysAgo.toLocaleDateString([], { weekday: 'long' })
    );
  });

  it('should return the time if the date is today', () => {
    expect(timestampToDate(today.getTime())).toBe(
      today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  });
});
