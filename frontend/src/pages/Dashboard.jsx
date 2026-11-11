import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Statistics from '../components/Statistics';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import ConnectBackendModal from '../components/ConnectBackendModal';
import {
  fetchTasks,
  fetchTaskStats,
  createTask,
  editTask,
  removeTask,
  toggleStatus,
} from '../services/graphqlService';
import { AlertCircle, CheckCircle, RefreshCw, Link2 } from 'lucide-react';

/**
 * Dashboard Page (Stateful Component)
 * 
 * Demonstrates:
 * - Central state management using useState hook
 * - Side-effect handling & API fetching using useEffect hook
 * - Integration with GraphQL backend using native fetch API
 * - Coordinating child components (Navbar, Statistics, FilterBar, TaskList, TaskForm, ConnectBackendModal)
 * - Toast notification feedback for success and error handling
 */
const Dashboard = () => {
  // State for task data and statistics
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });

  // State for loading and error indicators
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // State for filters and search queries
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // State for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // State for feedback toast messages
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // Formatted current date for Navbar display
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Display toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  /**
   * Load tasks and aggregated statistics from GraphQL backend
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Execute both GraphQL queries in parallel
      const [tasksData, statsData] = await Promise.all([
        fetchTasks({
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery,
        }),
        fetchTaskStats(),
      ]);

      setTasks(tasksData || []);
      setStats(statsData || { total: 0, completed: 0, pending: 0, overdue: 0 });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setErrorMessage(
        'Could not connect to GraphQL server. Make sure the backend is running on port 5000.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery]);

  // Initial load and reload when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * EVENT HANDLERS
   */

  // Open modal for creating a new task
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing task
  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Submit task creation or update via GraphQL mutation
  const handleFormSubmit = async (taskFormData) => {
    try {
      setIsSubmitting(true);

      if (editingTask && editingTask.id) {
        // Execute updateTask mutation
        await editTask(editingTask.id, taskFormData);
        showToast('Assignment updated successfully in MongoDB!', 'success');
      } else {
        // Execute addTask mutation
        await createTask(taskFormData);
        showToast('New academic assignment created successfully!', 'success');
      }

      handleCloseModal();
      await loadData(); // Refresh UI with updated data
    } catch (err) {
      console.error('Form submission failed:', err);
      showToast(err.message || 'Operation failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle completion status via GraphQL mutation
  const handleToggleStatus = async (taskId) => {
    try {
      // Optimistic update for instant UI responsiveness
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId
            ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
            : t
        )
      );

      // Perform GraphQL mutation
      const updated = await toggleStatus(taskId);

      showToast(
        `Task marked as ${updated.status === 'Completed' ? 'Completed' : 'Pending'}!`,
        'success'
      );

      // Refresh task statistics
      const updatedStats = await fetchTaskStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast('Failed to update task status.', 'error');
      // Revert by re-fetching
      loadData();
    }
  };

  // Delete task via GraphQL mutation
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this assignment from MongoDB?'
    );
    if (!confirmDelete) return;

    try {
      // Optimistic removal from state
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      // Perform GraphQL mutation
      await removeTask(taskId);

      showToast('Assignment deleted from MongoDB successfully.', 'success');

      // Refresh task statistics
      const updatedStats = await fetchTaskStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to delete task:', err);
      showToast('Failed to delete assignment.', 'error');
      loadData();
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="dashboard-layout">
      {/* Navbar Component */}
      <Navbar
        onOpenAddTask={handleOpenAddTask}
        currentDate={currentDate}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Toast Alert Notification */}
        {toast && (
          <div className={`toast-notification toast-${toast.type}`} role="alert">
            {toast.type === 'success' ? (
              <CheckCircle size={18} className="toast-icon" />
            ) : (
              <AlertCircle size={18} className="toast-icon" />
            )}
            <span className="toast-text">{toast.message}</span>
          </div>
        )}

        {/* Global Error Banner if Backend is Unreachable */}
        {errorMessage && (
          <div className="error-banner">
            <AlertCircle size={20} className="error-icon" />
            <div className="error-content">
              <h4 className="error-title">Backend Connection Issue</h4>
              <p className="error-desc">{errorMessage}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsConnectModalOpen(true)}
                style={{ gap: '0.35rem' }}
              >
                <Link2 size={14} /> Connect Render Backend
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadData}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards Component */}
        <Statistics stats={stats} isLoading={isLoading} />

        {/* Task Management & Filter Section */}
        <section className="tasks-section" aria-label="Task Management">
          <FilterBar
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            searchQuery={searchQuery}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onSearchChange={setSearchQuery}
            onResetFilters={handleResetFilters}
            totalMatching={tasks.length}
          />

          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onToggleStatus={handleToggleStatus}
            onEdit={handleOpenEditTask}
            onDelete={handleDeleteTask}
            onOpenAddTask={handleOpenAddTask}
          />
        </section>
      </main>

      {/* Connect Backend Modal */}
      <ConnectBackendModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={() => {
          loadData();
          showToast('Backend connected successfully!', 'success');
        }}
      />

      {/* Task Creation & Editing Modal Form */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>
          Student Task Manager • MCA Full Stack Web Development Micro Project • React.js + GraphQL + MongoDB
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
