import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No pieces found',
  description = 'Our artisans are crafting new designs. Please check back soon.',
}) => {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto"
    >
      <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center mb-4 text-gold">
        <PackageOpen className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
      </div>
      <h3 className="font-serif font-normal text-2xl text-ink">{title}</h3>
      <p className="font-sans text-xs sm:text-sm text-muted mt-2 leading-relaxed">{description}</p>
    </div>
  );
};
