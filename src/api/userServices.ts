import { DriverDropdown } from "@/types/userTypes";

const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5125/api/";

export const getDrivers = async (): Promise<DriverDropdown[]> => {
  const res = await fetch(`${BaseUrl}Driver/GetDrivers`);
  if (!res.ok) throw new Error(`Failed to fetch drivers: ${res.status}`);
  return await res.json();
};
