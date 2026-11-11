import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Save, AlertCircle, BookOpen, Calendar, Flag } from 'lucide-react';

/**
 * TaskForm Component (Stateful)
 * 
 * Demonstrates:
 * - Local state management using useState hook
 * - Lifecycle synchronization using useEffect hook (for editing existing tasks)
 * - Controlled form inputs with onChange handlers
 * - Form validation with clear inline error feedback
 * - Form submission via onSubmit event handler
 */
const TaskForm = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
  // Common academic subjects for quick selection
  const commonSubjects = [
    'Web Technologies',
    'Database Management Systems',
    'Data Structures & Algorithms',
    'Operating Systems',
    'Cloud Computing',
    'Software Engineering',
    'Artificial Intelligence',
    'Computer Networks',
  ];

  // Initial form values
  const defaultValues = {
    title: '',
    description: '',
    subject: 'Web Technologies',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
  };

  // State hook for form fields
  const [formData, setFormData] = useState(defaultValues);

  // State hook for form validation errors
  const [errors, setErrors] = useState({});

  // Populate form with initialData when editing an existing task
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        subject: initialData.subject || 'Web Technologies',
        priority: initialData.priority || 'Medium',
        dueDate: initialData.dueDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData(defaultValues);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // If modal is closed, do not render
  if (!isOpen) return null;

  // Generic onChange handler for input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form fields before submission
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required.';
    }

    if (!['High', 'Medium', 'Low'].includes(formData.priority)) {
      newErrors.priority = 'Priority must be High, Medium, or Low.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // onSubmit form event handler
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent standard browser full-page reload

    if (!validate()) {
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      subject: formData.subject.trim(),
      priority: formData.priority,
      dueDate: formData.dueDate,
    });
  };

  const isEditing = Boolean(initialData && initialData.id);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              {isEditing ? <Save size={20} /> : <PlusCircle size={20} />}
            </div>
            <div>
              <h2 className="modal-title">
                {isEditing ? 'Edit Academic Task' : 'Add New Academic Task'}
              </h2>
              <p className="modal-subtitle">
                {isEditing
                  ? 'Update assignment details and deadlines in MongoDB'
                  : 'Enter assignment details to save to MongoDB via GraphQL'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="task-form" noValidate>
          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Implement Dijkstra Algorithm Lab Report"
              value={formData.title}
              onChange={handleChange}
              maxLength={120}
              autoFocus
            />
            {errors.title && (
              <span className="field-error-msg">
                <AlertCircle size={13} /> {errors.title}
              </span>
            )}
          </div>

          {/* Subject Field & Datalist suggestions */}
          <div className="form-group">
            <label htmlFor="task-subject" className="form-label">
              <BookOpen size={14} className="label-icon" /> Subject / Course <span className="required-star">*</span>
            </label>
            <input
              id="task-subject"
              name="subject"
              type="text"
              list="subject-suggestions"
              className={`form-input ${errors.subject ? 'input-error' : ''}`}
              placeholder="e.g. Database Management Systems"
              value={formData.subject}
              onChange={handleChange}
              maxLength={80}
            />
            <datalist id="subject-suggestions">
              {commonSubjects.map((sub) => (
                <option key={sub} value={sub} />
              ))}
            </datalist>
            {errors.subject && (
              <span className="field-error-msg">
                <AlertCircle size={13} /> {errors.subject}
              </span>
            )}
          </div>

          {/* Dual Row: Priority & Due Date */}
          <div className="form-row-dual">
            {/* Priority Field */}
            <div className="form-group">
              <label htmlFor="task-priority" className="form-label">
                <Flag size={14} className="label-icon" /> Priority <span className="required-star">*</span>
              </label>
              <select
                id="task-priority"
                name="priority"
                className={`form-select ${errors.priority ? 'input-error' : ''}`}
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
              {errors.priority && (
                <span className="field-error-msg">
                  <AlertCircle size={13} /> {errors.priority}
                </span>
              )}
            </div>

            {/* Due Date Field */}
            <div className="form-group">
              <label htmlFor="task-dueDate" className="form-label">
                <Calendar size={14} className="label-icon" /> Due Date <span className="required-star">*</span>
              </label>
              <input
                id="task-dueDate"
                name="dueDate"
                type="date"
                className={`form-input ${errors.dueDate ? 'input-error' : ''}`}
                value={formData.dueDate}
                onChange={handleChange}
              />
              {errors.dueDate && (
                <span className="field-error-msg">
                  <AlertCircle size={13} /> {errors.dueDate}
                </span>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="task-description" className="form-label">
              Description / Instructions <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="task-description"
              name="description"
              rows={3}
              className="form-textarea"
              placeholder="Add lab assignment guidelines, references, chapter numbers, or submission link..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Form Actions Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Saving to MongoDB...</span>
              ) : isEditing ? (
                <>
                  <Save size={16} />
                  <span>Update Task</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
