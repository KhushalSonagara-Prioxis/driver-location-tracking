"use client";

import { Trip, TripUpdate, AddTripRequest } from "@/types/tripTypes";
import { Location } from "@/types/locationTypes";
import { TripStatus, TripUpdateStatus } from "@/types/enums";
import { useFetchWithAuth } from "../auth/fetchWithAuth";

const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL!;
const TripUrl = `${BaseUrl.replace(/\/$/, "")}/Trip`;

export function useTripService() {
  const fetchWithAuth = useFetchWithAuth();

  // 🚗 1. Get Driver Current Location
  const getTripCurrentLocation = async (tripSID: string): Promise<Trip> => {
    const res = await fetchWithAuth(`${BaseUrl}Driver/GetCurrentLocation/${tripSID}`);
    if (!res.ok) throw new Error(`Trip not found: ${res.status}`);
    return res.json();
  };

  // 📍 2. Update Driver’s Current Location
  const updateDriverCurrentLocation = async (currentTripId: string, loc: Location) => {
    const res = await fetchWithAuth(
      `${BaseUrl}Driver/UpdateDriverCurrentLocation/${currentTripId}`,
      {
        method: "POST",
        body: JSON.stringify({
          latitude: loc.lat,
          longitude: loc.lng,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to update location:", res.status, text);
    }
  };

  // 🧾 3. Get Trips (with filters, pagination, etc.)
  const getDriverTrips = async ({
    searchText = "",
    page = 1,
    pageSize = 10,
    sortColumn = "lastModifiedDate",
    sortOrder = "DESC",
    sid = "",
    statusFilter = "",
  }: {
    searchText?: string;
    page?: number;
    pageSize?: number;
    sortColumn?: string;
    sortOrder?: "ASC" | "DESC";
    sid?: string;
    statusFilter?: TripStatus | "";
  }): Promise<{ result: Trip[]; meta: any }> => {
    const url = new URL(`${BaseUrl.replace(/\/$/, "")}/Driver/GetAllTripsOfDriver`);

    url.searchParams.append("SearchText", searchText);
    url.searchParams.append("Page", page.toString());
    url.searchParams.append("PageSize", pageSize.toString());
    url.searchParams.append("SortColumn", sortColumn);
    url.searchParams.append("SortOrder", sortOrder);

    const filters: any[] = [];
    if (statusFilter) filters.push({ key: "tripStatus", value: statusFilter, condition: "=" });
    if (sid) filters.push({ key: "UserSID", value: sid, condition: "=" });

    if (filters.length > 0) {
      url.searchParams.append("Filters", JSON.stringify(filters));
    }

    const res = await fetchWithAuth(url.toString());
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch trips: ${res.status} ${text}`);
    }

    return await res.json();
  };

  const getTrips = async ({
    searchText = "",
    page = 1,
    pageSize = 10,
    sortColumn = "lastModifiedDate",
    sortOrder = "DESC",
    sid = "",
    statusFilter = "",
  }: {
    searchText?: string;
    page?: number;
    pageSize?: number;
    sortColumn?: string;
    sortOrder?: "ASC" | "DESC";
    sid?: string;
    statusFilter?: TripStatus | "";
  }): Promise<{ result: Trip[]; meta: any }> => {
    const url = new URL(`${BaseUrl.replace(/\/$/, "")}/Trip`);

    url.searchParams.append("SearchText", searchText);
    url.searchParams.append("Page", page.toString());
    url.searchParams.append("PageSize", pageSize.toString());
    url.searchParams.append("SortColumn", sortColumn);
    url.searchParams.append("SortOrder", sortOrder);

    const filters: any[] = [];
    if (statusFilter) filters.push({ key: "tripStatus", value: statusFilter, condition: "=" });
    if (sid) filters.push({ key: "UserSID", value: sid, condition: "=" });

    if (filters.length > 0) {
      url.searchParams.append("Filters", JSON.stringify(filters));
    }

    const res = await fetchWithAuth(url.toString());
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch trips: ${res.status} ${text}`);
    }

    return await res.json();
  };

  // 🔍 4. Get Trip by SID
  const getTripBySID = async (tripSID: string): Promise<Trip | null> => {
    const url = `${TripUrl}?Filters=${encodeURIComponent(
      JSON.stringify([{ key: "TripSID", value: tripSID, condition: "=" }])
    )}`;

    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error(`Failed to fetch trip: ${res.status}`);

    const data = await res.json();
    return data?.result?.[0] ?? null;
  };

  // 🔍 4. Get Trip by SID
  const getDriverTripBySID = async (tripSID: string): Promise<Trip | null> => {
    const url = `${BaseUrl}Driver/GetAllTripsOfDriver?Filters=${encodeURIComponent(
      JSON.stringify([{ key: "TripSID", value: tripSID, condition: "=" }])
    )}`;

    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error(`Failed to fetch trip: ${res.status}`);

    const data = await res.json();
    return data?.result?.[0] ?? null;
  };


  // 🔁 5. Get Trip Updates
  const getTripUpdates = async (tripSID: string): Promise<TripUpdate[]> => {
    const url = `${TripUrl}/GetTripUpdateStatus/${tripSID}`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error(`Failed to fetch trip updates: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  // ▶️ 6. Start Trip
  const startTrip = async (tripSID: string) => {
    const res = await fetchWithAuth(`${TripUrl}/TripStart/${tripSID}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to start trip: ${res.status}`);
    return res.json();
  };

  // ⏹️ 7. End Trip
  const endTrip = async (tripSID: string) => {
    const res = await fetchWithAuth(`${TripUrl}/TripEnd/${tripSID}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to end trip: ${res.status}`);
    return res.json();
  };

  // 📝 8. Add Trip Status
  const addTripStatus = async (
    tripSID: string,
    status: TripUpdateStatus,
    latitude: number,
    longitude: number,
    note: string
  ) => {
    const res = await fetchWithAuth(`${TripUrl}/AddTripStatus/${tripSID}`, {
      method: "POST",
      body: JSON.stringify({
        tripUpdateStatus: status,
        tripUpdatedLatitude: latitude,
        tripUpdatedLongitude: longitude,
        note,
      }),
    });

    if (!res.ok) throw new Error(`Failed to update trip status: ${res.status}`);
    return res.json();
  };

  // ➕ 9. Add New Trip
  const addTrip = async (trip: AddTripRequest): Promise<any> => {
    const res = await fetchWithAuth(`${TripUrl}/AddTrip`, {
      method: "POST",
      body: JSON.stringify(trip),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to add trip: ${res.status} ${text}`);
    }
    return res.json();
  };

  return {
    getTripCurrentLocation,
    updateDriverCurrentLocation,
    getTrips,
    getDriverTrips,
    getTripBySID,
    getDriverTripBySID,
    getTripUpdates,
    startTrip,
    endTrip,
    addTripStatus,
    addTrip,
  };
}
