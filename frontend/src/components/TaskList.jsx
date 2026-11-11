import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { LayoutGrid, List, Inbox, Plus } from 'lucide-react';

/**
 * TaskList Component (Stateful)
 * 
 * Demonstrates:
 * - Managing local view state (grid vs list view layout)
 * - Rendering list of items using array map with unique keys
 * - Passing props and event handlers down to child TaskCard components
 * - Responsive empty state and loading skeletons
 */
const TaskList = ({ tasks, isLoading, onToggleStatus, onEdit, onDelete, onOpenAddTask }) => {
  // Local state for toggling between card grid and compact list layout
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  if (isLoading) {
    return (
      <div className="task-list-loading">
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="task-skeleton-card">
              <div className="skeleton-line skeleton-tag" />
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-desc" />
              <div className="skeleton-line skeleton-footer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-wrapper">
          <Inbox size={42} className="empty-icon" />
        </div>
        <h3 className="empty-title">No Academic Tasks Found</h3>
        <p className="empty-desc">
          There are no assignments matching your current filter criteria, or you haven't added any tasks yet.
        </p>
        <button
          type="button"
          className="btn btn-primary empty-add-btn"
          onClick={onOpenAddTask}
        >
          <Plus size={16} />
          <span>Add Your First Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="task-list-wrapper">
      {/* Top Controls: Tasks Counter and View Mode Switcher */}
      <div className="task-list-header">
        <h2 className="task-list-heading">
          Academic Assignments
          <span className="task-count-pill">{tasks.length}</span>
        </h2>

        <div className="view-toggle-group">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Task Cards Grid / List Container */}
      <div className={`tasks-container ${viewMode === 'list' ? 'tasks-container-list' : 'tasks-container-grid'}`}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
