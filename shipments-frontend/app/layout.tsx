import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Shipments - Gestión de Envíos y Tracking',
  description:
    'Sistema de gestión de envíos y seguimiento. Administra shipments, eventos de tracking y estados de entrega.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}

