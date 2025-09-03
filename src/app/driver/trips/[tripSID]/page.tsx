"use client";

import { useDriverLocation } from "@/context/DriverLocationContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function DriverTripDetailPage() {
  const params = useParams();
  const tripSID = params.tripSID as string | undefined;

  const { location, setCurrentTripId } = useDriverLocation();

  if (!tripSID) {
    return <p>Error: Trip ID not found</p>;
  }

  useEffect(() => {
    console.log(tripSID)
    setCurrentTripId(tripSID);

    return () => setCurrentTripId(null);
  }, [tripSID, setCurrentTripId]);

  return (
    <div>
      <h1>Trip Detail: {tripSID}</h1>
      <p>
        Current Location:{" "}
        {location
          ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
          : "N/A"}
      </p>
    </div>
  );
}
