"use client";

import { useRouter } from "next/navigation";
import { Role, Status } from "@/types/enums";

export default function LoginPage() {
  const router = useRouter();

  const loginAs = (role: Role) => {
    let userSID = "";

    if (role === Role.Admin) {
      userSID = "USR-C36FE804-CE27-43D5-A5FB-C91F08B36EFA"; 
    } else if (role === Role.Driver) {
      userSID = "USR-0CC69F93-0FC3-47D6-943E-270E0FB21E30"; 
    }

    document.cookie = `userSID=${userSID}; path=/`;
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
