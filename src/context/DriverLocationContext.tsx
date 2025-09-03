"use client";

import { createContext, useEffect, useState, useContext } from "react";

interface Location {
  lat: number;
  lng: number;
}

interface DriverLocationContextValue {
  location: Location | null;
  setCurrentTripId: (tripId: string | null) => void;
}

const DriverLocationContext = createContext<DriverLocationContextValue>({
  location: null,
  setCurrentTripId: () => {},
});

export const DriverLocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateLocation = async () => {
      if (!navigator.geolocation || !currentTripId) return;

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        setLocation(loc);

        try {
          console.log("Updating location for trip:", currentTripId, loc);

          const res = await fetch(
            `http://localhost:5125/api/Driver/UpdateDriverCurrentLocation/${currentTripId}`,
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
      });
    };

    if (currentTripId) {
      updateLocation(); // initial call
      interval = setInterval(updateLocation, 10000); // poll every 10 sec
    }

    return () => clearInterval(interval);
  }, [currentTripId]);

  return (
    <DriverLocationContext.Provider value={{ location, setCurrentTripId }}>
      {children}
    </DriverLocationContext.Provider>
  );
};

export const useDriverLocation = () => useContext(DriverLocationContext);
