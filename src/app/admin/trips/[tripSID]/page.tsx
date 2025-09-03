"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GoogleMap from "@/cmp/GoogleMap";


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
  const [currentLocationName,setCurrectLocationName] = useState<string | null>(null);

  useEffect(() => {
    if (!tripSID) {
      setError("Trip ID not found");
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchTrip = async () => {
      try {
        const res = await fetch(
          `http://localhost:5125/api/Driver/GetCurrentLocation/${tripSID}`
        );

        if (!res.ok) throw new Error(`Trip not found: ${res.status}`);
        
        const data: Trip = await res.json();
        setTrip(data);
        console.log(data)
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch trip");
        setTrip(null);
      }
    };

    fetchTrip();
    interval = setInterval(fetchTrip, 10000); // refresh every 10s

    return () => clearInterval(interval);
  }, [tripSID]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!trip) return <p>Loading trip...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trip Detail: {trip.tripSID}</h1>

      <p>
        <b>Start:</b> {trip.startLocationName} ({trip.startLatitude},{" "}
        {trip.startLongitude})
      </p>
      <p>
        <b>Destination:</b> {trip.toLocationName} ({trip.toLatitude},{" "}
        {trip.toLongitude})
      </p>
      <GoogleMap
        lat={trip.driverLatitude}
        lng={trip.driverLongitude}
        zoom={15}
      />

      <script
        async
        defer
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`}
      ></script>
    </div>
  );
}
