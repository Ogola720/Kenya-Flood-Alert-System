import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Kenya Flood Alert System | FFEWS',
  description: 'Flash Flood Early Warning and Evacuation System for Kenyan cities. Real-time monitoring, intelligent alerts, and dynamic evacuation routing.',
  keywords: 'flood, Kenya, Nairobi, early warning, evacuation, FFEWS, disaster, alert',
  icons: {
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
