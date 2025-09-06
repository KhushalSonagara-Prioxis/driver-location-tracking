"use client";

import { GoogleMapProps } from "@/types/locationTypes";
import { useEffect, useRef } from "react";



export default function GoogleMap({ lat, lng, zoom = 14 }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom,
      });

      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: "Truck Location",
        icon: {
          url: "/truck-icon.png", // place truck-icon.png inside /public folder
          scaledSize: new window.google.maps.Size(50, 50),
        },
      });
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
      mapInstanceRef.current.panTo({ lat, lng });
    }
  }, [lat, lng]);

  return <div ref={mapRef} className="w-100 h-100 rounded-lg shadow-lg" />;
}
