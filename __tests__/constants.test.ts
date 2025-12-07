import { TASK_STATUS, PRIORITY_LABELS } from '@/lib/constants';

describe('Constants', () => {
  describe('TASK_STATUS', () => {
    it('should have correct status values', () => {
      expect(TASK_STATUS.TODO).toBe('todo');
      expect(TASK_STATUS.IN_PROGRESS).toBe('in-progress');
      expect(TASK_STATUS.DONE).toBe('done');
    });

    it('should have all required status types', () => {
      expect(Object.keys(TASK_STATUS)).toContain('TODO');
      expect(Object.keys(TASK_STATUS)).toContain('IN_PROGRESS');
      expect(Object.keys(TASK_STATUS)).toContain('DONE');
    });
  });

  describe('PRIORITY_LABELS', () => {
    it('should have correct priority labels', () => {
      expect(PRIORITY_LABELS.low).toBe('Low');
      expect(PRIORITY_LABELS.medium).toBe('Medium');
      expect(PRIORITY_LABELS.high).toBe('High');
    });

    it('should have all priority levels', () => {
      expect(Object.keys(PRIORITY_LABELS)).toContain('low');
      expect(Object.keys(PRIORITY_LABELS)).toContain('medium');
      expect(Object.keys(PRIORITY_LABELS)).toContain('high');
    });
  });
});
