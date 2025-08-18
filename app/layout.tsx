import './globals.css';
import { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import Providers from '@/providers/page';
import FcmListener from '@/components/common/fcm-listener';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo.ico" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <TooltipProvider>
            <Toaster />
            <FcmListener />
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
