'use client';

import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Force dark theme for admin pages
    document.documentElement.classList.add('dark');
    
    // Clean up when leaving admin section
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  return <>{children}</>;
}