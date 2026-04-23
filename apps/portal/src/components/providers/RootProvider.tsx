'use client';

import { Toaster } from 'react-hot-toast';
import ReactQueryProvider from './ReactQueryProvider';

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ReactQueryProvider>
  );
}
