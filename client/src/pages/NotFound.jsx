import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const NotFound = () => {
  useEffect(() => { document.title = '404 — SafeGuard'; }, []);
  return (
    <PageWrapper className="flex min-h-screen items-center justify-center overflow-x-hidden bg-gray-50 dark:bg-gray-900">
      <div className="text-center px-4">
        <div className="text-9xl font-extrabold text-red-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
          >
            Back to Home
          </Link>
          <Link
            to="/alerts"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-red-600 px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            View Alerts
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
};

export default NotFound;
