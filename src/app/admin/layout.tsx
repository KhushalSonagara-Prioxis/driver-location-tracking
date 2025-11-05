import { ReactNode } from "react";
import ProtectedRoute from "@/cmp/ProtectedRoute";
import { Role } from "@/types/enums";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[Role.Admin]}>
      <div className="flex min-h-screen">
        <main className="flex-1 p-4">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
