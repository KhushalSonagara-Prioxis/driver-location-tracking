"use client";

import { useEffect, useState } from "react";
import { getTrips } from "@/api/tripServices";
import { Trip } from "@/types/tripTypes";
import Link from "next/link";
import { TripStatus } from "@/types/enums";
import AddTripForm from "@/cmp/form/AddTripForm";

export default function AdminTripListPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState("lastModifiedDate");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [statusFilter, setStatusFilter] = useState<TripStatus | "">("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTrips({
        searchText,
        sortColumn,
        sortOrder,
        page,
        pageSize: 10,
        statusFilter,
      });
      setTrips(data.result);
      setTotalPages(data.meta?.total_page_num ?? 1);
      setError(null);
    } catch (err: any) {
      console.error("UI error fetching trips:", err);
      setError(err.message || "Failed to fetch trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchText, sortColumn, sortOrder, page, statusFilter]);

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-black min-h-screen text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Trips (Admin)</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          + Add Trip
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading trips...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-x-2">
        <input
          type="text"
          placeholder="Search trips..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
          className="border px-2 py-1 rounded"
        />

        <select
          value={sortColumn}
          onChange={(e) => setSortColumn(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="lastModifiedDate">Last Modified</option>
          <option value="driverName">Driver</option>
          <option value="createdByName">Created By</option>
          <option value="startLocationName">Start Location</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "ASC" | "DESC")}
          className="border px-2 py-1 rounded"
        >
          <option value="ASC">ASC</option>
          <option value="DESC">DESC</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value ? Number(e.target.value) as TripStatus : "");
            setPage(1);
          }}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Statuses</option>
          <option value={TripStatus.Pending}>Pending</option>
          <option value={TripStatus.InProgress}>In Progress</option>
          <option value={TripStatus.Completed}>Completed</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full ">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-2 py-1 text-left">Driver</th>
              <th className="px-2 py-1 text-left">Start</th>
              <th className="px-2 py-1 text-left">Destination</th>
              <th className="px-2 py-1 text-left">Status</th>
              <th className="px-2 py-1 text-left">Last Modified</th>
              <th className="px-2 py-1 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.tripSID} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-2 py-1">{trip.driverName ?? "-"}</td>
                <td className="px-2 py-1">{trip.startLocationName}</td>
                <td className="px-2 py-1">{trip.toLocationName}</td>
                <td className="px-2 py-1">{trip.tripStatusName}</td>
                <td className="px-2 py-1">
                  {trip.lastModifiedDate
                    ? new Date(trip.lastModifiedDate).toLocaleString()
                    : "-"}
                </td>
                <td className="px-2 py-1">
                  <Link href={`trips/${trip.tripSID}`} className="text-blue-600 underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && trips.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-2">
                  No trips found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {showAddForm && (
        <AddTripForm
          onClose={() => setShowAddForm(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
