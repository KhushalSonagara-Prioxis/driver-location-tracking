import { Trip, TripUpdate, AddTripRequest } from "@/types/tripTypes";
import { Location } from "@/types/locationTypes";
import { TripStatus, TripUpdateStatus } from "@/types/enums";

// const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5125/api/";
const TripUrl = `${BaseUrl.replace(/\/$/, "")}/Trip`;


export const getTripCurrentLocation = async (tripSID: string): Promise<Trip> => {
  const res = await fetch(`${BaseUrl}Driver/GetCurrentLocation/${tripSID}`);
  if (!res.ok) {
    throw new Error(`Trip not found: ${res.status}`);
  }
  return res.json();
};

export const updateDriverCurrentLocation = async (currentTripId: string, loc: Location) => {
  try {
    const res = await fetch(
      `${BaseUrl}Driver/UpdateDriverCurrentLocation/${currentTripId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  } catch (err) {
    console.error("Network error updating location:", err);
  }
};



export const getTrips = async ({
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
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5125/api"}/Trip`
    );

    url.searchParams.append("SearchText", searchText);
    url.searchParams.append("Page", page.toString());
    url.searchParams.append("PageSize", pageSize.toString());
    url.searchParams.append("SortColumn", sortColumn);
    url.searchParams.append("SortOrder", sortOrder);

    const filters: any[] = [];
    if (statusFilter) {
      filters.push({ key: "tripStatus", value: statusFilter, condition: "=" });
    }
    if (sid) {
      filters.push({ key: "UserSID", value: sid, condition: "=" });
    }

    if (filters.length > 0) {
      url.searchParams.append("Filters", JSON.stringify(filters));
    }

    console.log("Trip API URL:", url.toString());

    const res = await fetch(url.toString());
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch trips: ${res.status} ${text}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error("Error in getTrips:", err);
    throw new Error(err.message || "Unexpected error fetching trips");
  }
};


export const getTripBySID = async (tripSID: string): Promise<Trip | null> => {
  try {
    console.log("Fetching trip with SID:", tripSID);

    const url = `${TripUrl}?Filters=${encodeURIComponent(
      JSON.stringify([{ key: "TripSID", value: tripSID, condition: "=" }])
    )}`;

    console.log("URL called:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch trip: ${res.status}`);

    const data = await res.json();
    console.log("Trip data:", data);

    return data?.result?.[0] ?? null;
  } catch (err: any) {
    console.error("getTripBySID error:", err);
    throw new Error(err.message || "Unexpected error fetching trip");
  }
};


export const getTripUpdates = async (tripSID: string): Promise<TripUpdate[]> => {
  try {
    const url = `${TripUrl}/GetTripUpdateStatus/${tripSID}`;
    console.log("getTripUpdates URL:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch trip updates: ${res.status}`);

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err: any) {
    console.error("getTripUpdates error:", err);
    throw new Error(err.message || "Unexpected error fetching trip updates");
  }
};



export const startTrip = async (tripSID: string) => {
  try {
    const res = await fetch(`${TripUrl}/TripStart/${tripSID}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to start trip: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error("startTrip error:", err);
    throw new Error(err.message || "Unexpected error starting trip");
  }
};

export const endTrip = async (tripSID: string) => {
  try {
    const res = await fetch(`${TripUrl}/TripEnd/${tripSID}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to end trip: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error("endTrip error:", err);
    throw new Error(err.message || "Unexpected error ending trip");
  }
};

export const addTripStatus = async (
  tripSID: string,
  status: TripUpdateStatus,
  latitude: number,
  longitude: number,
  note: string
) => {
  try {
    const res = await fetch(`${TripUrl}/AddTripStatus/${tripSID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripUpdateStatus: status,
        tripUpdatedLatitude: latitude,
        tripUpdatedLongitude: longitude,
        note,
      }),
    });
    if (!res.ok) throw new Error(`Failed to update trip status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error("addTripStatus error:", err);
    throw new Error(err.message || "Unexpected error updating trip status");
  }
};


export const addTrip = async (trip: AddTripRequest): Promise<any> => {
  try {
    const res = await fetch(`${TripUrl}/AddTrip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to add trip: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("addTrip error:", err);
    throw new Error(err.message || "Unexpected error adding trip");
  }
};