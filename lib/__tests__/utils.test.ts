import { cn, formatDate, isOverdue, isDueSoon } from '../utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toContain('conditional-class');
      expect(cn('base-class', false && 'conditional-class')).not.toContain('conditional-class');
    });

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('should handle undefined and null values', () => {
      expect(cn('class1', undefined, 'class2', null)).toBe('class1 class2');
    });
  });

  describe('formatDate', () => {
    it('should format valid date string', () => {
      const result = formatDate('2025-12-25');
      expect(result).toBe('Dec 25, 2025');
    });

    it('should return "No due date" for null', () => {
      expect(formatDate(null)).toBe('No due date');
    });

    it('should return "No due date" for empty string', () => {
      expect(formatDate('')).toBe('No due date');
    });

    it('should format another valid date', () => {
      const result = formatDate('2025-01-15');
      expect(result).toBe('Jan 15, 2025');
    });
  });

  describe('isOverdue', () => {
    const now = new Date('2025-12-06T12:00:00Z');

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return true for past dates with pending status', () => {
      expect(isOverdue('2025-12-05', 'pending')).toBe(true);
      expect(isOverdue('2025-12-01', 'in_progress')).toBe(true);
    });

    it('should return false for today', () => {
      expect(isOverdue('2025-12-06', 'pending')).toBe(false);
    });

    it('should return false for future dates', () => {
      expect(isOverdue('2025-12-07', 'pending')).toBe(false);
      expect(isOverdue('2025-12-31', 'pending')).toBe(false);
    });

    it('should return false for null date', () => {
      expect(isOverdue(null, 'pending')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isOverdue('', 'pending')).toBe(false);
    });

    it('should return false when status is done', () => {
      expect(isOverdue('2025-12-01', 'completed')).toBe(false);
    });
  });

  describe('isDueSoon', () => {
    const now = new Date('2025-12-06T12:00:00Z');

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return true for dates within 3 days', () => {
      expect(isDueSoon('2025-12-07', 'pending')).toBe(true); // Tomorrow
      expect(isDueSoon('2025-12-08', 'pending')).toBe(true); // 2 days
      expect(isDueSoon('2025-12-09', 'pending')).toBe(true); // 3 days
    });

    it('should return true for today', () => {
      expect(isDueSoon('2025-12-06', 'pending')).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(isDueSoon('2025-12-05', 'pending')).toBe(false);
      expect(isDueSoon('2025-12-01', 'pending')).toBe(false);
    });

    it('should return false for dates more than 3 days away', () => {
      expect(isDueSoon('2025-12-10', 'pending')).toBe(false);
      expect(isDueSoon('2025-12-31', 'pending')).toBe(false);
    });

    it('should return false for null date', () => {
      expect(isDueSoon(null, 'pending')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isDueSoon('', 'pending')).toBe(false);
    });

    it('should return false when status is done', () => {
      expect(isDueSoon('2025-12-07', 'completed')).toBe(false);
    });
  });
});
