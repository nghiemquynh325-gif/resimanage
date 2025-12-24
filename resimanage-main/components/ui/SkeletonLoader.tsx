
import React from 'react';
import { cn } from '../../utils';

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className, ...props }) => {
  return (
    <div 
      className={cn("animate-pulse bg-slate-200 rounded-md", className)} 
      {...props} 
    />
  );
};

export default SkeletonLoader;
