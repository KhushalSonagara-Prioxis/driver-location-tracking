// import { DriverDropdown } from "@/types/userTypes";

// const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL! ;

// export const getDrivers = async (): Promise<DriverDropdown[]> => {
//   const res = await fetchWithAuth(`${BaseUrl}Driver/GetDrivers`);
//   if (!res.ok) throw new Error(`Failed to fetch drivers: ${res.status}`);
//   return await res.json();
// };


"use client";

import { DriverDropdown } from "@/types/userTypes";
import { useFetchWithAuth } from "@/auth/fetchWithAuth";

const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL!;

export function useUserService() {
  const fetchWithAuth = useFetchWithAuth();

  const getDrivers = async (): Promise<DriverDropdown[]> => {
    const res = await fetchWithAuth(`${BaseUrl}Driver/GetDrivers`);
    if (!res.ok) {
      throw new Error(`Failed to fetch drivers: ${res.status}`);
    }
    return await res.json();
  };

  return {
    getDrivers,
  };
}
