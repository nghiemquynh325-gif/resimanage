
import React from 'react';
import SkeletonLoader from '../ui/SkeletonLoader';

const ApprovalCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg h-[340px] border border-slate-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-50 flex items-center gap-3">
        <SkeletonLoader className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader className="h-4 w-3/4 rounded" />
          <SkeletonLoader className="h-3 w-1/3 rounded" />
        </div>
      </div>
      
      {/* Body */}
      <div className="p-4 space-y-4 flex-1">
        <div className="space-y-3">
          <SkeletonLoader className="h-3 w-full rounded" />
          <SkeletonLoader className="h-3 w-5/6 rounded" />
          <SkeletonLoader className="h-3 w-4/6 rounded" />
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-50">
           <SkeletonLoader className="h-3 w-24 mb-2 rounded" />
           <div className="flex gap-3">
             <SkeletonLoader className="w-24 h-16 rounded" />
             <SkeletonLoader className="w-24 h-16 rounded" />
           </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-50 grid grid-cols-2 gap-3">
        <SkeletonLoader className="h-10 rounded" />
        <SkeletonLoader className="h-10 rounded" />
      </div>
    </div>
  );
};

export default ApprovalCardSkeleton;
