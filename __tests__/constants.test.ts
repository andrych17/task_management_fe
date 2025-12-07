import { TASK_STATUS, TASK_STATUS_LABELS, TASK_STATUS_ICONS } from '@/lib/constants';

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

  describe('TASK_STATUS_LABELS', () => {
    it('should have correct status labels', () => {
      expect(TASK_STATUS_LABELS['todo']).toBe('To Do');
      expect(TASK_STATUS_LABELS['in-progress']).toBe('In Progress');
      expect(TASK_STATUS_LABELS['done']).toBe('Done');
    });
  });

  describe('TASK_STATUS_ICONS', () => {
    it('should have icons for all statuses', () => {
      expect(TASK_STATUS_ICONS['todo']).toBe('📝');
      expect(TASK_STATUS_ICONS['in-progress']).toBe('⚙️');
      expect(TASK_STATUS_ICONS['done']).toBe('✅');
    });
  });
});
