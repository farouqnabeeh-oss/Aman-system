'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-red-50 p-6 text-red-900">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
        <h2 className="text-2xl font-black mb-4 uppercase text-red-600">Critical Application Error</h2>
        <p className="mb-4 text-sm font-semibold">An unexpected error crashed the dashboard. Please send this exact error message to the developer:</p>
        
        <div className="bg-red-50 p-4 rounded-xl mb-6 overflow-auto border border-red-200 text-left" dir="ltr">
          <p className="font-mono text-sm font-bold text-red-700">{error.name}: {error.message}</p>
          {error.stack && (
            <pre className="mt-4 text-[10px] font-mono text-red-800 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>

        <button
          className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
          onClick={() => reset()}
        >
          Try to recover (Reload)
        </button>
      </div>
    </div>
  );
}
