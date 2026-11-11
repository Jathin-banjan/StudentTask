import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

/**
 * TaskCard Component (Stateless / Reusable)
 * 
 * Demonstrates:
 * - Rendering individual academic task item
 * - Custom badges for priority levels (High, Medium, Low)
 * - Due date calculations & overdue warning indicator
 * - Props callbacks for onClick: onToggleStatus, onEdit, onDelete
 */
const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const isCompleted = task.status === 'Completed';

  // Check if task is overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !isCompleted && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !isCompleted && task.dueDate === todayStr;

  // Format date nicely (e.g. "Nov 15, 2026")
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Dynamic priority badge styles
  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'priority-badge-high';
      case 'low':
        return 'priority-badge-low';
      case 'medium':
      default:
        return 'priority-badge-medium';
    }
  };

  return (
    <article className={`task-card ${isCompleted ? 'completed-card' : ''} ${isOverdue ? 'overdue-card' : ''}`}>
      {/* Top Header: Subject & Priority Badge */}
      <div className="task-card-header">
        <span className="subject-pill">
          <BookOpen size={13} className="subject-icon" />
          <span className="subject-text">{task.subject}</span>
        </span>

        <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
          <span className="priority-dot" />
          {task.priority} Priority
        </span>
      </div>

      {/* Main Task Body: Status Toggle & Title */}
      <div className="task-card-body">
        <div className="task-status-row">
          <button
            type="button"
            className={`status-toggle-btn ${isCompleted ? 'checked' : 'unchecked'}`}
            onClick={() => onToggleStatus(task.id)}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
            aria-label={`Toggle task completion for ${task.title}`}
          >
            {isCompleted ? (
              <CheckCircle2 size={22} className="check-icon-active" />
            ) : (
              <Circle size={22} className="circle-icon-inactive" />
            )}
          </button>

          <h3 className={`task-title ${isCompleted ? 'task-title-completed' : ''}`}>
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      {/* Card Footer: Due Date Badge & Action Buttons */}
      <div className="task-card-footer">
        <div className="task-due-info">
          <Calendar size={14} className="due-calendar-icon" />
          <span className="due-date-text">{formatDisplayDate(task.dueDate)}</span>

          {isOverdue && (
            <span className="overdue-tag" title="This assignment is past its due date">
              <AlertCircle size={12} /> Overdue
            </span>
          )}

          {isDueToday && (
            <span className="due-today-tag" title="Due today!">
              <Clock size={12} /> Due Today
            </span>
          )}
        </div>

        <div className="task-actions-group">
          {/* Edit Task Button */}
          <button
            type="button"
            className="btn-action btn-action-edit"
            onClick={() => onEdit(task)}
            title="Edit this task"
            aria-label={`Edit ${task.title}`}
          >
            <Edit3 size={15} />
            <span className="btn-action-text">Edit</span>
          </button>

          {/* Delete Task Button */}
          <button
            type="button"
            className="btn-action btn-action-delete"
            onClick={() => onDelete(task.id)}
            title="Delete this task"
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 size={15} />
            <span className="btn-action-text">Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default TaskCard;
