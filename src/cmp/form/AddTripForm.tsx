"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { addTrip } from "@/api/tripServices";
import { getDrivers } from "@/api/userServices";
import { getLocations } from "@/api/locationServices";
import { AddTripRequest } from "@/types/tripTypes";
import { DriverDropdown } from "@/types/userTypes";
import { LocationDropdown } from "@/types/locationTypes";

interface AddTripFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function AddTripForm({ onSuccess, onClose }: AddTripFormProps) {
  const [formData, setFormData] = useState<AddTripRequest>({
    startLatitude: 0,
    startLongitude: 0,
    toLatitude: 0,
    toLongitude: 0,
    startLocationSID: "",
    toLocationSID: "",
    driverSID: "",
    userSID: "",
  });

  const [drivers, setDrivers] = useState<DriverDropdown[]>([]);
  const [locations, setLocations] = useState<LocationDropdown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [driverData, locationData] = await Promise.all([
          getDrivers(),
          getLocations(),
        ]);
        setDrivers(driverData);
        setLocations(locationData);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };

    const userSID = Cookies.get("userSID");
    if (userSID) {
      setFormData((prev) => ({ ...prev, userSID }));
    }

    fetchDropdowns();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...prev,
      startLatitude: 0,
      startLongitude: 0,
      toLatitude: 0,
      toLongitude: 0,
      startLocationSID: "",
      toLocationSID: "",
      driverSID: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addTrip(formData);
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error adding trip:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-lg border border-gray-300 dark:border-gray-700 pointer-events-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold">Add Trip</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Latitude
            </label>
            <input
              type="number"
              name="startLatitude"
              value={formData.startLatitude}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Start Longitude
            </label>
            <input
              type="number"
              name="startLongitude"
              value={formData.startLongitude}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Destination Latitude
            </label>
            <input
              type="number"
              name="toLatitude"
              value={formData.toLatitude}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Destination Longitude
            </label>
            <input
              type="number"
              name="toLongitude"
              value={formData.toLongitude}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Start Location
            </label>
            <select
              name="startLocationSID"
              value={formData.startLocationSID}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Select Start Location</option>
              {locations
                .filter((loc) => loc.locationSID !== formData.toLocationSID)
                .map((loc) => (
                  <option key={loc.locationSID} value={loc.locationSID}>
                    {loc.locationName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Destination Location
            </label>
            <select
              name="toLocationSID"
              value={formData.toLocationSID}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Select Destination</option>
              {locations
                .filter((loc) => loc.locationSID !== formData.startLocationSID)
                .map((loc) => (
                  <option key={loc.locationSID} value={loc.locationSID}>
                    {loc.locationName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Driver</label>
            <select
              name="driverSID"
              value={formData.driverSID}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.userSID} value={driver.userSID}>
                  {driver.userName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Trip"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
