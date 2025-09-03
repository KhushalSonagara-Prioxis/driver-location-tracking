"use client";

import { useRouter } from "next/navigation";
import { Role, Status } from "@/lib/enums";

export default function LoginPage() {
  const router = useRouter();

  const loginAs = (role: Role) => {
    document.cookie = `userId=123; path=/`;
    document.cookie = `role=${role}; path=/`;
    document.cookie = `status=${Status.Active}; path=/`;

    if (role === Role.Admin) router.push("/admin/dashboard");
    if (role === Role.Driver) router.push("/driver/trips");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <button
        onClick={() => loginAs(Role.Admin)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Login as Admin
      </button>
      <button
        onClick={() => loginAs(Role.Driver)}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Login as Driver
      </button>
    </div>
  );
}
