import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

/**
 * FilterBar Component (Stateless / Reusable)
 * 
 * Demonstrates:
 * - Controlled input handling via onChange props
 * - Tab/button selection handling via onClick props
 * - Clear filters event handling
 */
const FilterBar = ({
  statusFilter,
  priorityFilter,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onResetFilters,
  totalMatching,
}) => {
  const statusOptions = ['All', 'Pending', 'Completed'];
  const priorityOptions = ['All', 'High', 'Medium', 'Low'];

  const hasActiveFilters =
    statusFilter !== 'All' || priorityFilter !== 'All' || searchQuery.trim() !== '';

  return (
    <div className="filter-bar-container">
      <div className="filter-bar-top">
        {/* Search Input Box */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by assignment title or subject..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="task-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Priority Filter Dropdown */}
        <div className="priority-select-wrapper">
          <Filter size={16} className="filter-select-icon" />
          <select
            className="priority-select"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            id="priority-filter-dropdown"
          >
            <option value="All">All Priorities</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>
        </div>
      </div>

      {/* Status Filter Buttons and Results Counter */}
      <div className="filter-bar-bottom">
        <div className="status-tabs-group" role="tablist">
          {statusOptions.map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`status-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onStatusChange(status)}
              >
                {status}
              </button>
            );
          })}
        </div>

        <div className="filter-meta-group">
          <span className="results-counter">
            Showing <strong>{totalMatching}</strong> {totalMatching === 1 ? 'task' : 'tasks'}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={onResetFilters}
              title="Reset all search & filter options"
            >
              <SlidersHorizontal size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
