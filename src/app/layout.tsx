"use client";
import "./globals.css";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/auth/login");
  }, [router]);

  return (
    <html lang="en">
      <body>
        {/* Top Navigation */}
        <header className="flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            My App
          </h1>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
