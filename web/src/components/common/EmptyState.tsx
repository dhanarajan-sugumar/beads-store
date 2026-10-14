import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  description = 'Our artisans are crafting new pieces. Please check back soon!',
}) => {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto"
    >
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4 text-primary-600">
        <PackageOpen className="w-8 h-8" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-serif font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
};
