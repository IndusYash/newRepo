import React from 'react';

// For jet reports, you might use these statuses and priorities:
export interface StatusBadgeProps {
  status:
    | "pending"
    | "reviewed"
    | "approved"
    | "rejected"
    | "submitted"
    | "spotted"
    | "published";
  priority: "low" | "medium" | "high" | "urgent";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, priority }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'pending':
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
      case 'published':
      case 'spotted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityDot = () => {
    if (!priority) return null;
    const dotColor = {
      low: 'bg-blue-400',
      medium: 'bg-yellow-400',
      high: 'bg-orange-400',
      urgent: 'bg-red-500 animate-pulse',
    }[priority];

    return (
      <span className={`w-2 h-2 rounded-full ${dotColor} mr-1`}></span>
    );
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ${getStatusClasses()}`}>
      {getPriorityDot()}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;
