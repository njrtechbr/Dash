import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { DashboardSettingsProvider, ThemeWrapper } from '@/hooks/use-dashboard-settings';
import { DialogManagers } from '@/components/dashboard/dialog-managers';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
  title: 'FluxDash',
  description: 'Seu painel pessoal para sistemas web.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary />
        <DashboardSettingsProvider>
          <ThemeWrapper>
            {children}
            <DialogManagers />
          </ThemeWrapper>
        </DashboardSettingsProvider>
        <Toaster />
      </body>
    </html>
  );
}
