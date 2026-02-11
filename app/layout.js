import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Euro ERP",
  description: "Enterprise Resource Planning System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          marginLeft: '72px',
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          position: 'relative',
          width: 'calc(100% - 72px)'
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
