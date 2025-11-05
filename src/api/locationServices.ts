"use client";

import { LocationDropdown } from "@/types/locationTypes";
import { useFetchWithAuth } from "@/auth/fetchWithAuth";

const BaseUrl: string =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5125/api/";

export function useLocationService() {
  const fetchWithAuth = useFetchWithAuth();

  const getLocations = async (): Promise<LocationDropdown[]> => {
    const res = await fetchWithAuth(`${BaseUrl}Location`);
    if (!res.ok) {
      throw new Error(`Failed to fetch locations: ${res.status}`);
    }
    return await res.json();
  };

  return {
    getLocations,
  };
}
