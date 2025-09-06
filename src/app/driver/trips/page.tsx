"use client";

import { useEffect, useState } from "react";
import { getTrips } from "@/api/tripServices";
import { Trip } from "@/types/tripTypes";
import Link from "next/link";
import { TripStatus } from "@/types/enums";
import Cookies from "js-cookie"; 

export default function DriverTripListPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState("lastModifiedDate");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [statusFilter, setStatusFilter] = useState<TripStatus | "">("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const userSID = Cookies.get("userSID");

  useEffect(() => {
    console.log(userSID)
    if (!userSID) {
      setError("User not logged in or missing userSID.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTrips({
          searchText,
          sortColumn,
          sortOrder,
          page,
          pageSize: 10,
          sid: userSID,
          statusFilter,
        });

        const result = data.result;
        console.log(result)
        setTrips(result);
        setTotalPages(data.meta?.total_page_num ?? 1);
        setError(null);
      } catch (err: any) {
        console.error("UI error fetching driver trips:", err);
        setError(err.message || "Failed to fetch trips");
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchText, sortColumn, sortOrder, page, statusFilter, userSID]);

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-black min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-xl font-bold">My Trips</h1>

      {loading && <p className="text-gray-600 dark:text-gray-400">Loading trips...</p>}
      {error && <p className="text-red-500">{error}</p>}


      <input
        type="text"
        placeholder="Search trips..."
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setPage(1);
        }}
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 
                   text-gray-900 dark:text-gray-100 px-2 py-1 rounded w-full sm:w-1/2"
      />


      <div className="space-x-2">
        <select
          value={sortColumn}
          onChange={(e) => setSortColumn(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100 px-2 py-1 rounded"
        >
          <option value="lastModifiedDate">Last Modified</option>
          <option value="startLocationName">Start Location</option>
          <option value="toLocationName">Destination</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "ASC" | "DESC")}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100 px-2 py-1 rounded"
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
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100 px-2 py-1 rounded"
        >
          <option value="">All Statuses</option>
          <option value={TripStatus.Pending}>Pending</option>
          <option value={TripStatus.InProgress}>In Progress</option>
          <option value={TripStatus.Completed}>Completed</option>
        </select>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
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
                <td className="px-2 py-1">{trip.startLocationName}</td>
                <td className="px-2 py-1">{trip.toLocationName}</td>
                <td className="px-2 py-1">{trip.tripStatusName}</td>
                <td className="px-2 py-1">
                  {trip.lastModifiedDate
                    ? new Date(trip.lastModifiedDate).toLocaleString()
                    : "-"}
                </td>
                <td className="px-2 py-1">
                  <Link
                    href={`/driver/trips/${trip.tripSID}`}
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && trips.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-2 text-gray-600 dark:text-gray-400">
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
        <span>Page {page} of {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
