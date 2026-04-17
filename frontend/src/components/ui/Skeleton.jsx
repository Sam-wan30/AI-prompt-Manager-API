import React from 'react';

/**
 * Skeleton Component
 * Production-grade loading skeleton with various variants
 */

const Skeleton = ({ 
  className = '', 
  variant = 'default', 
  width, 
  height, 
  lines = 1,
  animate = true 
}) => {
  const baseClasses = 'bg-gray-200 rounded-lg';
  const animationClasses = animate ? 'animate-pulse' : '';
  const combinedClasses = `${baseClasses} ${animationClasses} ${className}`;

  const renderContent = () => {
    switch (variant) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={`${combinedClasses} h-4`}
                style={{
                  width: index === lines - 1 ? '60%' : '100%',
                  ...width && { width: typeof width === 'number' ? `${width}px` : width }
                }}
              />
            ))}
          </div>
        );

      case 'circle':
        return (
          <div
            className={`${combinedClasses} rounded-full`}
            style={{
              width: width || '40px',
              height: height || '40px'
            }}
          />
        );

      case 'rect':
        return (
          <div
            className={combinedClasses}
            style={{
              width: width || '100%',
              height: height || '20px'
            }}
          />
        );

      case 'card':
        return (
          <div className="bg-white rounded-lg shadow-soft p-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`${combinedClasses} w-12 h-12 rounded-full`} />
              <div className="flex-1 space-y-2">
                <div className={`${combinedClasses} h-4 w-3/4`} />
                <div className={`${combinedClasses} h-3 w-1/2`} />
              </div>
            </div>
            <div className="space-y-3">
              <div className={`${combinedClasses} h-3 w-full`} />
              <div className={`${combinedClasses} h-3 w-5/6`} />
              <div className={`${combinedClasses} h-3 w-4/6`} />
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="bg-white rounded-lg shadow-soft overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200">
              <div className={`${combinedClasses} h-4 w-1/4`} />
            </div>
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className={`${combinedClasses} w-8 h-8 rounded-full`} />
                    <div className="flex-1 space-y-2">
                      <div className={`${combinedClasses} h-4 w-3/4`} />
                      <div className={`${combinedClasses} h-3 w-1/2`} />
                    </div>
                    <div className={`${combinedClasses} h-6 w-16 rounded`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-soft p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className={`${combinedClasses} h-4 w-20`} />
                      <div className={`${combinedClasses} h-8 w-12`} />
                    </div>
                    <div className={`${combinedClasses} w-12 h-12 rounded-lg`} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Content Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-soft p-6">
                  <div className={`${combinedClasses} h-6 w-32 mb-4`} />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`${combinedClasses} w-8 h-8 rounded-full`} />
                          <div className="space-y-2">
                            <div className={`${combinedClasses} h-4 w-24`} />
                            <div className={`${combinedClasses} h-3 w-16`} />
                          </div>
                        </div>
                        <div className={`${combinedClasses} h-4 w-12 rounded`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className={`${combinedClasses} h-4 w-24 mb-2`} />
                <div className={`${combinedClasses} h-10 w-full rounded-md`} />
              </div>
            ))}
            <div className="flex items-center space-x-4">
              <div className={`${combinedClasses} h-10 w-24 rounded-md`} />
              <div className={`${combinedClasses} h-10 w-32 rounded-md`} />
            </div>
          </div>
        );

      case 'prompt':
        return (
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className={`${combinedClasses} h-6 w-48`} />
                  <div className={`${combinedClasses} h-4 w-32`} />
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`${combinedClasses} h-8 w-16 rounded`} />
                  <div className={`${combinedClasses} h-8 w-16 rounded`} />
                </div>
              </div>
              <div className={`${combinedClasses} h-4 w-20`} />
              <div className={`${combinedClasses} h-20 w-full rounded`} />
              <div className="flex items-center space-x-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={`${combinedClasses} h-6 w-16 rounded-full`} />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            className={combinedClasses}
            style={{
              width: width || '100%',
              height: height || '20px'
            }}
          />
        );
    }
  };

  return renderContent();
};

// Pre-configured skeleton components
export const CardSkeleton = ({ className = '' }) => (
  <Skeleton variant="card" className={className} />
);

export const TableSkeleton = ({ className = '', rows = 5 }) => (
  <div className={className}>
    <Skeleton variant="table" />
  </div>
);

export const DashboardSkeleton = ({ className = '' }) => (
  <Skeleton variant="dashboard" className={className} />
);

export const FormSkeleton = ({ className = '' }) => (
  <Skeleton variant="form" className={className} />
);

export const PromptSkeleton = ({ className = '' }) => (
  <Skeleton variant="prompt" className={className} />
);

export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <Skeleton variant="text" lines={lines} className={className} />
);

export const AvatarSkeleton = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  return (
    <Skeleton 
      variant="circle" 
      className={`${sizeClasses[size]} ${className}`} 
    />
  );
};

export const ButtonSkeleton = ({ width = '100px', height = '40px', className = '' }) => (
  <Skeleton 
    variant="rect" 
    width={width} 
    height={height}
    className={`rounded-md ${className}`} 
  />
);

// Loading overlay component
export const LoadingOverlay = ({ visible, children }) => {
  if (!visible) return children;
  
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
      <div className="opacity-50">
        {children}
      </div>
    </div>
  );
};

// Page skeleton component
export const PageSkeleton = ({ variant = 'default' }) => {
  return (
    <div className="p-6">
      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'table' && <TableSkeleton />}
      {variant === 'form' && <FormSkeleton />}
      {variant === 'default' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Skeleton;
