"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Trip {
  tripSID: string;
  startLocationName: string;
  toLocationName: string;
  startLatitude: number;
  startLongitude: number;
  toLatitude: number;
  toLongitude: number;
  driverLatitude: number;
  driverLongitude: number;
}

export default function AdminTripDetailPage() {
  const params = useParams();
  const tripSID = params.tripSID as string | undefined;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripSID) {
      setError("Trip ID not found");
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchTrip = async () => {
      try {
        if (typeof window === "undefined") return;

        const res = await fetch(
          `http://localhost:5125/api/Driver/GetCurrentLocation/${tripSID}`
        );

        if (!res.ok) throw new Error(`Trip not found: ${res.status}`);

        const data: Trip = await res.json();
        console.log("Fetched data:", data);
        setTrip(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch trip location", err);
        setError(err.message || "Failed to fetch trip");
        setTrip(null);
      }
    };

    fetchTrip();
    interval = setInterval(fetchTrip, 10000);

    return () => clearInterval(interval);
  }, [tripSID]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!trip) return <p>Loading trip...</p>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Trip Detail: {trip.tripSID}</h1>

      <p>
        Start: {trip.startLocationName} ({trip.startLatitude}, {trip.startLongitude})
      </p>
      <p>
        Destination: {trip.toLocationName} ({trip.toLatitude}, {trip.toLongitude})
      </p>
      <p>
        Driver Location: ({trip.driverLatitude}, {trip.driverLongitude})
      </p>
    </div>
  );
}
