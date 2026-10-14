import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-16 text-center space-y-4">
      <h1 className="text-4xl font-serif font-bold text-gray-900">404</h1>
      <p className="text-gray-600">The page you were looking for could not be found.</p>
      <div>
        <Link
          to="/"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
        >
          Return to Catalogue
        </Link>
      </div>
    </div>
  );
};
