"use client";

import { useDriverLocation } from "@/context/DriverLocationContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TripStatus, TripUpdateStatus } from "@/types/enums";
import {
  getTripBySID,
  getTripUpdates,
  startTrip,
  endTrip,
  addTripStatus,
} from "@/api/tripServices";
import { TripUpdate, Trip } from "@/types/tripTypes";

export default function DriverTripDetailPage() {
  const params = useParams();
  const tripSID = params.tripSID as string | undefined;

  const { location, setCurrentTripId } = useDriverLocation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [updates, setUpdates] = useState<TripUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pauseNote, setPauseNote] = useState("");
  const [showPauseInput, setShowPauseInput] = useState(false);

  if (!tripSID) return <p className="text-red-500">Error: Trip ID not found</p>;
const fetchTripData = async () => {
  try {
    setLoading(true);

    const tripData = await getTripBySID(tripSID);
    console.log("Trip fetched page:", tripData);

    setTrip(tripData);
    if (
      tripData?.tripStatus === TripStatus.InProgress ||
      tripData?.tripStatus === TripStatus.Completed
    ) {
      const tripUpdates = await getTripUpdates(tripSID);
      setUpdates(tripUpdates);
    } else {
      setUpdates([]);
    }
  } catch (err) {
    console.error("fetchTripData error:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchTripData();
  }, [tripSID]);

  const handleAction = async (action: TripUpdateStatus) => {
    try {
      if (!tripSID) return;

      if (action === TripUpdateStatus.Start) {
        await startTrip(tripSID);
        setCurrentTripId(tripSID);
      } else if (action === TripUpdateStatus.End) {
        await endTrip(tripSID);
        setCurrentTripId(null);
      } else {
        await addTripStatus(
          tripSID,
          action,
          location?.lat || 0,
          location?.lng || 0,
          action === TripUpdateStatus.Pause ? pauseNote : "Resumed"
        );
        if (action === TripUpdateStatus.Resume) setCurrentTripId(tripSID);
      }

      setPauseNote("");
      setShowPauseInput(false);
      fetchTripData();
    } catch (err) {
      console.error("handleAction error:", err);
    }
  };

  const renderButtons = () => {
    if (!trip) return null;

    if (trip.tripStatus === TripStatus.Pending) {
      return (
        <button
          onClick={() => handleAction(TripUpdateStatus.Start)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Start Trip
        </button>
      );
    }

    if (trip.tripStatus === TripStatus.InProgress) {
      const lastUpdate = updates[0];
      if (lastUpdate?.tripUpdatesStatus === TripUpdateStatus.Pause) {
        return (
          <button
            onClick={() => handleAction(TripUpdateStatus.Resume)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Resume Trip
          </button>
        );
      }
      return (
        <div className="space-y-2">
          {showPauseInput ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={pauseNote}
                onChange={(e) => setPauseNote(e.target.value)}
                placeholder="Enter pause note"
                className="border px-2 py-1 rounded w-full"
              />
              <button
                onClick={() => handleAction(TripUpdateStatus.Pause)}
                disabled={!pauseNote.trim()}
                className="px-3 py-1 bg-yellow-600 text-white rounded"
              >
                Pause
              </button>
              <button
                onClick={() => setShowPauseInput(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <button
                onClick={() => setShowPauseInput(true)}
                className="px-3 py-1 bg-yellow-600 text-white rounded"
              >
                Pause
              </button>
              <button
                onClick={() => handleAction(TripUpdateStatus.End)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                End Trip
              </button>
            </div>
          )}
        </div>
      );
    }

    if (trip.tripStatus === TripStatus.Completed) {
      return (
        <p className="text-gray-500 font-medium">
          Trip completed. No actions available.
        </p>
      );
    }

    return null;
  };

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-black min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-xl font-bold">Trip Detail: {tripSID}</h1>
      {loading && <p>Loading trip data...</p>}
      <p>
        Current Location:{" "}
        {location
          ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
          : "N/A"}
      </p>

      <div>{renderButtons()}</div>

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
              <p className="text-sm text-gray-600 dark:text-gray-400">{u.note}</p>
              <p className="text-xs text-gray-500">
                {new Date(u.timeStamp).toLocaleString()}
              </p>
            </li>
          ))
        ) : trip?.tripStatus === TripStatus.Pending ? (
          <p className="text-gray-500">Trip is pending. No updates yet.</p>
        ) : (
          <p className="text-gray-500">
            No updates recorded for this trip.
          </p>
        )}
      </ul>
    </div>
  );
}
