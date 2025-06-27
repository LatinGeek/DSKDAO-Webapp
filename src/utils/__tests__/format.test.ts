import { formatCurrency, formatNumber, formatDate, formatTimeAgo } from '../format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format numbers as currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-500)).toBe('-$500.00');
    });

    it('should handle decimal places correctly', () => {
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(10.99)).toBe('$10.99');
      expect(formatCurrency(10)).toBe('$10.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(100)).toBe('100');
    });

    it('should handle decimal numbers', () => {
      expect(formatNumber(1000.5)).toBe('1,000.5');
      expect(formatNumber(1234.567)).toBe('1,234.567');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-1234.56)).toBe('-1,234.56');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00Z');

    it('should format date in default format', () => {
      const formatted = formatDate(testDate);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    it('should format date with custom format', () => {
      const formatted = formatDate(testDate, 'YYYY-MM-DD');
      expect(formatted).toBe('2024-01-15');
    });

    it('should handle different date formats', () => {
      const formatted = formatDate(testDate, 'MM/DD/YYYY');
      expect(formatted).toBe('01/15/2024');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toMatch(/Jan 15, 2024/);
    });
  });

  describe('formatTimeAgo', () => {
    const now = new Date('2024-01-15T10:30:00Z');

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should show "just now" for very recent times', () => {
      const recentTime = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(formatTimeAgo(recentTime)).toBe('just now');
    });

    it('should show minutes ago', () => {
      const minutesAgo = new Date(now.getTime() - 5 * 60000); // 5 minutes ago
      expect(formatTimeAgo(minutesAgo)).toBe('5 minutes ago');
    });

    it('should show hours ago', () => {
      const hoursAgo = new Date(now.getTime() - 2 * 3600000); // 2 hours ago
      expect(formatTimeAgo(hoursAgo)).toBe('2 hours ago');
    });

    it('should show days ago', () => {
      const daysAgo = new Date(now.getTime() - 3 * 86400000); // 3 days ago
      expect(formatTimeAgo(daysAgo)).toBe('3 days ago');
    });

    it('should show weeks ago', () => {
      const weeksAgo = new Date(now.getTime() - 2 * 7 * 86400000); // 2 weeks ago
      expect(formatTimeAgo(weeksAgo)).toBe('2 weeks ago');
    });

    it('should show months ago', () => {
      const monthsAgo = new Date(now.getTime() - 2 * 30 * 86400000); // ~2 months ago
      expect(formatTimeAgo(monthsAgo)).toBe('2 months ago');
    });

    it('should handle singular forms', () => {
      const oneMinuteAgo = new Date(now.getTime() - 60000); // 1 minute ago
      expect(formatTimeAgo(oneMinuteAgo)).toBe('1 minute ago');

      const oneHourAgo = new Date(now.getTime() - 3600000); // 1 hour ago
      expect(formatTimeAgo(oneHourAgo)).toBe('1 hour ago');

      const oneDayAgo = new Date(now.getTime() - 86400000); // 1 day ago
      expect(formatTimeAgo(oneDayAgo)).toBe('1 day ago');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values gracefully', () => {
      expect(() => formatCurrency(null as any)).not.toThrow();
      expect(() => formatNumber(undefined as any)).not.toThrow();
    });

    it('should handle invalid dates', () => {
      expect(() => formatDate(new Date('invalid'))).not.toThrow();
      expect(() => formatTimeAgo(new Date('invalid'))).not.toThrow();
    });

    it('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      expect(() => formatNumber(largeNumber)).not.toThrow();
      expect(() => formatCurrency(largeNumber)).not.toThrow();
    });

    it('should handle negative zero', () => {
      expect(formatNumber(-0)).toBe('0');
      expect(formatCurrency(-0)).toBe('$0.00');
    });
  });
});