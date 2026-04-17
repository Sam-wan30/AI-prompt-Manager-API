import React from 'react';
import { FileText, Plus, Search, Zap, Inbox, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Empty State Components
 * Production-grade empty states with different variants and actions
 */

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'p-4',
    default: 'p-8',
    lg: 'p-12'
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    default: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`
      text-center
      ${sizeClasses[size]}
      ${className}
    `}>
      {illustration ? (
        <div className="mb-6">
          {illustration}
        </div>
      ) : Icon && (
        <div className="mx-auto mb-6">
          <Icon className={`${iconSizes[size]} text-gray-400`} />
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="btn btn-primary"
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="btn btn-secondary"
            >
              {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4 mr-2" />}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Pre-configured empty state components
export const EmptyPromptLibrary = ({ onAction, className = '' }) => (
  <EmptyState
    icon={FileText}
    title="No prompts yet"
    description="Get started by creating your first AI prompt or generate one with our AI assistant."
    action={{
      label: 'Create Prompt',
      icon: Plus,
      onClick: onAction
    }}
    secondaryAction={{
      label: 'Generate with AI',
      icon: Zap,
      onClick: () => window.location.href = '/ai/generator'
    }}
    className={className}
  />
);

export const EmptySearchResults = ({ searchTerm, onClear, className = '' }) => (
  <EmptyState
    icon={Search}
    title={`No results for "${searchTerm}"`}
    description="Try adjusting your search terms or filters to find what you're looking for."
    action={{
      label: 'Clear Search',
      onClick: onClear
    }}
    className={className}
  />
);

export const EmptyDashboard = ({ onCreatePrompt, onGenerateAI, className = '' }) => (
  <EmptyState
    icon={Inbox}
    title="Welcome to your dashboard"
    description="Your prompt library is empty. Start by creating prompts or generating them with AI."
    action={{
      label: 'Create Prompt',
      icon: Plus,
      onClick: onCreatePrompt
    }}
    secondaryAction={{
      label: 'Generate with AI',
      icon: Zap,
      onClick: onGenerateAI
    }}
    className={className}
  />
);

export const EmptyAIHistory = ({ onGenerate, className = '' }) => (
  <EmptyState
    icon={Zap}
    title="No AI generations yet"
    description="Start generating AI prompts to see your history here."
    action={{
      label: 'Generate Prompt',
      icon: Zap,
      onClick: onGenerate
    }}
    className={className}
  />
);

export const EmptyAnalytics = ({ className = '' }) => (
  <EmptyState
    icon={AlertCircle}
    title="No data available"
    description="Analytics data will appear here once you start using the prompt manager."
    className={className}
  />
);

export const EmptyFavorites = ({ onBrowse, className = '' }) => (
  <EmptyState
    icon={FileText}
    title="No favorites yet"
    description="Save prompts to your favorites to see them here."
    action={{
      label: 'Browse Prompts',
      icon: Search,
      onClick: onBrowse
    }}
    className={className}
  />
);

export const EmptyRecentActivity = ({ className = '' }) => (
  <EmptyState
    icon={RefreshCw}
    title="No recent activity"
    description="Your recent prompt usage and activity will appear here."
    size="sm"
    className={className}
  />
);

export const EmptyNotifications = ({ className = '' }) => (
  <EmptyState
    icon={AlertCircle}
    title="No notifications"
    description="You're all caught up! New notifications will appear here."
    size="sm"
    className={className}
  />
);

export const EmptySettings = ({ className = '' }) => (
  <EmptyState
    icon={AlertCircle}
    title="No settings available"
    description="Settings and preferences will appear here once they're configured."
    size="sm"
    className={className}
  />
);

// Error state components
export const ErrorState = ({ 
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
  className = ''
}) => (
  <EmptyState
    icon={AlertCircle}
    title={title}
    description={description}
    action={onRetry && {
      label: 'Try Again',
      icon: RefreshCw,
      onClick: onRetry
    }}
    className={className}
  />
);

export const NetworkError = ({ onRetry, className = '' }) => (
  <ErrorState
    title="Network error"
    description="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    className={className}
  />
);

export const ServerError = ({ onRetry, className = '' }) => (
  <ErrorState
    title="Server error"
    description="The server is experiencing issues. Please try again later."
    onRetry={onRetry}
    className={className}
  />
);

export const NotFoundError = ({ onGoHome, className = '' }) => (
  <ErrorState
    title="Page not found"
    description="The page you're looking for doesn't exist or has been moved."
    action={onGoHome && {
      label: 'Go Home',
      icon: FileText,
      onClick: onGoHome
    }}
    className={className}
  />
);

// Loading state components
export const LoadingState = ({ 
  title = 'Loading...',
  description = 'Please wait while we fetch your content.',
  className = ''
}) => (
  <EmptyState
    icon={RefreshCw}
    title={title}
    description={description}
    className={className}
  />
);

// Custom empty state builder
export const createEmptyState = ({ 
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = 'default'
}) => (
  <EmptyState
    icon={icon}
    title={title}
    description={description}
    action={action}
    secondaryAction={secondaryAction}
    illustration={illustration}
    size={size}
  />
);

// Empty state wrapper for conditional rendering
export const EmptyStateWrapper = ({ 
  condition, 
  children, 
  emptyStateProps,
  className = ''
}) => {
  if (condition) {
    return children;
  }

  return (
    <div className={className}>
      <EmptyState {...emptyStateProps} />
    </div>
  );
};

// Empty state for data tables
export const EmptyTableState = ({ 
  title = 'No data available',
  description = 'There are no items to display in this table.',
  onAction,
  actionLabel,
  className = ''
}) => (
  <div className={`text-center py-12 ${className}`}>
    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {description}
    </p>
    {onAction && (
      <button
        onClick={onAction}
        className="btn btn-primary"
      >
        {actionLabel || 'Add Item'}
      </button>
    )}
  </div>
);

// Empty state for lists
export const EmptyListState = ({ 
  icon = FileText,
  title = 'No items found',
  description = 'This list is currently empty.',
  onAction,
  actionLabel,
  className = ''
}) => (
  <div className={`text-center py-8 ${className}`}>
    <div className="mx-auto mb-4">
      <icon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-sm font-medium text-gray-900 mb-1">
      {title}
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      {description}
    </p>
    {onAction && (
      <button
        onClick={onAction}
        className="btn btn-secondary btn-sm"
      >
        {actionLabel || 'Add Item'}
      </button>
    )}
  </div>
);

export default EmptyState;
