import { LocationDropdown } from "@/types/locationTypes";

const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5125/api/";


export const getLocations = async (): Promise<LocationDropdown[]> => {
  const res = await fetch(`${BaseUrl}Location`);
  if (!res.ok) throw new Error(`Failed to fetch locations: ${res.status}`);
  return await res.json();
};
