"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GoogleMap from "@/cmp/GoogleMap";
import {
  getTripBySID,
  getTripUpdates,
  getTripCurrentLocation,
} from "@/api/tripServices";
import { Trip, TripUpdate } from "@/types/tripTypes";
import { TripStatus, TripUpdateStatus } from "@/types/enums";

export default function AdminTripDetailPage() {
  const params = useParams();
  const tripSID = params.tripSID as string | undefined;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [updates, setUpdates] = useState<TripUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripSID) {
      setError("Trip ID not found");
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchTrip = async () => {
      try {
        const data = await getTripBySID(tripSID);

        if (!data) {
          setError("Trip not found");
          setTrip(null);
          return;
        }

        setTrip(data);
        setError(null);

        if (data.tripStatus === TripStatus.InProgress) {
          const locationData = await getTripCurrentLocation(tripSID);
          setTrip((prev) =>
            prev ? { ...prev, ...locationData } : { ...data, ...locationData }
          );
        }

        if (
          data.tripStatus === TripStatus.InProgress ||
          data.tripStatus === TripStatus.Completed
        ) {
          const tripUpdates = await getTripUpdates(tripSID);
          setUpdates(tripUpdates);
        } else {
          setUpdates([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch trip");
        setTrip(null);
      }
    };

    fetchTrip();
    if (trip?.tripStatus === TripStatus.InProgress) {
      interval = setInterval(fetchTrip, 5000);
    }

    return () => clearInterval(interval);
  }, [tripSID, trip?.tripStatus]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!trip) return <p>Loading trip...</p>;

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-black min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold">Trip Detail: {trip.tripSID}</h1>

      {(trip.tripStatus === TripStatus.InProgress ||
        trip.tripStatus === TripStatus.Completed) &&
        trip.driverLatitude &&
        trip.driverLongitude &&
        !isNaN(Number(trip.driverLatitude)) &&
        !isNaN(Number(trip.driverLongitude)) && (
          <div className="w-full h-[400px] rounded-lg overflow-hidden shadow">
            <GoogleMap
              lat={Number(trip.driverLatitude)}
              lng={Number(trip.driverLongitude)}
              zoom={15}
            />
          </div>
        )}


      <div className="space-y-2">
        <p>
          <b>Start:</b> {trip.startLocationName ?? "N/A"} (
          {trip.startLatitude ?? "N/A"},{" "}
          {trip.startLongitude ?? "N/A"})
        </p>
        <p>
          <b>Destination:</b> {trip.toLocationName ?? "N/A"} (
          {trip.toLatitude ?? "N/A"},{" "}
          {trip.toLongitude ?? "N/A"})
        </p>
        <p>
          <b>Status:</b> {trip.tripStatusName}
        </p>
        <p>
          <b>Driver:</b> {trip.driverName ?? "N/A"}
        </p>

        <p>
          <b>Last Modified:</b>{" "}
          {trip.lastModifiedDate
            ? new Date(trip.lastModifiedDate).toLocaleString()
            : "N/A"}
        </p>
      </div>
      <div>
        <h2 className="text-lg font-semibold mt-4">Trip History</h2>
        <ul className="space-y-2">
          {updates.length > 0 ? (
            updates.map((u) => (
              <li
                key={u.tripUpdatesSID}
                className="border p-2 rounded bg-gray-50 dark:bg-gray-800"
              >
                <p>
                  <span className="font-semibold">{u.driverName}</span> –{" "}
                  {TripUpdateStatus[u.tripUpdatesStatus]}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {u.note}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(u.timeStamp).toLocaleString()}
                </p>
              </li>
            ))
          ) : trip.tripStatus === TripStatus.Pending ? (
            <p className="text-gray-500">Trip is pending. No updates yet.</p>
          ) : (
            <p className="text-gray-500">No updates recorded for this trip.</p>
          )}
        </ul>
      </div>
      <script
        async
        defer
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`}
      ></script>
    </div>
  );
}
