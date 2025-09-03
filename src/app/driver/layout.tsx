import { ReactNode } from "react";
import { DriverLocationProvider } from "@/context/DriverLocationContext";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <DriverLocationProvider>
      <div className="flex min-h-screen">
        <main className="flex-1 p-4">{children}</main>
      </div>
    </DriverLocationProvider>
  );
}
