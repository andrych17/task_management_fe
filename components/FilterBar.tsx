import { useState, useEffect } from 'react';
import { Project, Tag, TaskStatus } from '@/types';

interface FilterBarProps {
  projects: Project[];
  tags: Tag[];
  onFilterChange: (filters: {
    project_id: number | null;
    tag_ids: number[];
    status: TaskStatus | null;
  }) => void;
}

export default function FilterBar({ projects, tags, onFilterChange }: FilterBarProps) {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    onFilterChange({
      project_id: selectedProject,
      tag_ids: selectedTags,
      status: selectedStatus,
    });
  }, [selectedProject, selectedTags, selectedStatus]);

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedProject(null);
    setSelectedTags([]);
    setSelectedStatus(null);
  };

  const hasActiveFilters = selectedProject !== null || selectedTags.length > 0 || selectedStatus !== null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6" data-testid="filter-bar">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
            data-testid="clear-filters"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            data-testid="project-filter"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value ? (e.target.value as TaskStatus) : null)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            data-testid="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="border border-gray-300 rounded-md p-2 max-h-24 overflow-y-auto" data-testid="tags-filter">
            {tags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags available</p>
            ) : (
              tags.map((tag) => (
                <label key={tag.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="rounded"
                    data-testid={`tag-checkbox-${tag.id}`}
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
