import './globals.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skill Assessment Platform',
  description: 'Role-based, stack-based technical assessment platform with live coding sandbox & telemetry',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] antialiased min-h-screen transition-colors duration-150">
        <div className="min-h-screen flex flex-col md:flex-row">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
