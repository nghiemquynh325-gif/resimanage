
import React from 'react';
import SkeletonLoader from '../ui/SkeletonLoader';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-1">
        <SkeletonLoader className="h-8 w-64 mb-2" />
        <SkeletonLoader className="h-4 w-96" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-slate-50 flex items-center justify-between">
            <div className="space-y-3">
              <SkeletonLoader className="h-4 w-24" />
              <SkeletonLoader className="h-8 w-16" />
            </div>
            <SkeletonLoader className="h-12 w-12 rounded-full" />
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Gender Chart Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-50 h-[380px] flex flex-col">
          <SkeletonLoader className="h-4 w-32 mb-6" />
          <div className="flex-1 flex items-center justify-center">
            <SkeletonLoader className="w-48 h-48 rounded-full border-8 border-slate-100 bg-transparent" />
          </div>
        </div>
        
        {/* Age Chart Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-50 h-[380px] flex flex-col">
          <SkeletonLoader className="h-4 w-32 mb-6" />
          <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
            <SkeletonLoader className="w-full h-[40%]" />
            <SkeletonLoader className="w-full h-[70%]" />
            <SkeletonLoader className="w-full h-[50%]" />
            <SkeletonLoader className="w-full h-[30%]" />
            <SkeletonLoader className="w-full h-[20%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
