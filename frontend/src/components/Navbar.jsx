import React from 'react';
import { CheckSquare, Plus, Calendar, GraduationCap, Link2 } from 'lucide-react';

/**
 * Navbar Component (Stateless / Reusable)
 * 
 * Demonstrates:
 * - Functional stateless component receiving props
 * - Event handling via onClick callback (onOpenAddTask)
 * - Modern clean navigation header
 */
const Navbar = ({ onOpenAddTask, currentDate, onOpenConnectModal }) => {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand & Logo */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <CheckSquare className="brand-icon" size={26} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h1 className="brand-title">Student Task Manager</h1>
              <span className="academic-badge">
                <GraduationCap size={13} className="academic-badge-icon" /> MCA Project
              </span>
            </div>
            <p className="brand-subtitle">Organize Assignments, Track Deadlines & Boost Productivity</p>
          </div>
        </div>

        {/* Right Actions: Connect button, Date indicator & Add Task Button */}
        <div className="navbar-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenConnectModal}
            title="Configure Render backend URL"
            style={{ gap: '0.35rem' }}
          >
            <Link2 size={14} />
            <span>Connect Backend</span>
          </button>

          <div className="date-badge" title="Current Academic Date">
            <Calendar size={16} className="date-icon" />
            <span>{currentDate}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary add-task-btn"
            onClick={onOpenAddTask}
            id="btn-add-task"
          >
            <Plus size={18} />
            <span>Add New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
