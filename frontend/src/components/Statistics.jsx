import React from 'react';
import { BookOpen, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

/**
 * Statistics Component (Stateless / Reusable)
 * 
 * Demonstrates:
 * - Reusable UI component displaying aggregated metrics
 * - Props consumption for total, completed, pending, and overdue tasks
 * - Dynamic calculation of completion progress percentage
 */
const Statistics = ({ stats, isLoading }) => {
  const { total = 0, completed = 0, pending = 0, overdue = 0 } = stats || {};

  // Calculate completion percentage safely
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statCards = [
    {
      id: 'total',
      label: 'Total Tasks',
      value: total,
      desc: 'All recorded assignments',
      icon: BookOpen,
      themeClass: 'stat-total',
      badge: `${total} tasks`,
    },
    {
      id: 'completed',
      label: 'Completed Tasks',
      value: completed,
      desc: `${completionPercentage}% overall completion`,
      icon: CheckCircle2,
      themeClass: 'stat-completed',
      badge: `${completionPercentage}% done`,
    },
    {
      id: 'pending',
      label: 'Pending Tasks',
      value: pending,
      desc: 'In-progress assignments',
      icon: Clock,
      themeClass: 'stat-pending',
      badge: 'Action needed',
    },
    {
      id: 'overdue',
      label: 'Overdue Tasks',
      value: overdue,
      desc: overdue > 0 ? 'Past deadline' : 'No overdue tasks',
      icon: AlertTriangle,
      themeClass: 'stat-overdue',
      badge: overdue > 0 ? 'Urgent' : 'All on time',
    },
  ];

  return (
    <section className="statistics-section" aria-label="Task Statistics">
      <div className="statistics-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className={`stat-card ${card.themeClass}`}>
              <div className="stat-card-header">
                <span className="stat-label">{card.label}</span>
                <div className="stat-icon-wrapper">
                  <Icon size={20} />
                </div>
              </div>

              <div className="stat-card-body">
                <div className="stat-number">
                  {isLoading ? <span className="stat-skeleton">--</span> : card.value}
                </div>
                <div className="stat-badge-tag">{card.badge}</div>
              </div>

              <div className="stat-card-footer">
                <p className="stat-desc">{card.desc}</p>
                {card.id === 'completed' && total > 0 && (
                  <div className="progress-bar-bg" title={`${completionPercentage}% completed`}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Statistics;
