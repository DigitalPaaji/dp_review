
"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiMail,
  FiExternalLink,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiLoader,
  FiDatabase,
} from "react-icons/fi";

const ClientsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    totalClients: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [limit, setLimit] = useState(
    Number(searchParams.get("limit")) || 10
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAllClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      const response = await axios.get(
        `/api/admin/clients?${params.toString()}`
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch clients");
      }

      setClients(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Get clients error:", err);
      setError(
        err.response?.data?.message || "Unable to load clients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    getAllClients();
  }, [getAllClients]);

  // Keep pagination in the URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("limit", String(limit));

    const query = params.toString();
    const currentQuery = searchParams.toString();

    if (query !== currentQuery) {
      router.replace(`?${query}`, { scroll: false });
    }
  }, [page, limit, router, searchParams]);

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
  };

  const changeLimit = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredClients = clients.filter((client) => {
    const value = search.toLowerCase().trim();

    if (!value) return true;

    return (
      (client.businessName || "").toLowerCase().includes(value) ||
      (client.email || "").toLowerCase().includes(value) ||
      (client.placeId || "").toLowerCase().includes(value)
    );
  });

  const startItem =
    pagination.totalClients === 0 ? 0 : (page - 1) * limit + 1;

  const endItem = Math.min(
    page * limit,
    pagination.totalClients
  );

  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const start = Math.max(1, page - 2);
    const end = Math.min(total, page + 2);

    return Array.from(
      { length: Math.max(0, end - start + 1) },
      (_, i) => start + i
    );
  };

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-4 text-gray-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <FiDatabase size={16} />
              <span>Admin</span>
              <span>/</span>
              <span>Clients</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Clients
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your clients and their QR review links.
            </p>
          </div>

          <button
            onClick={getAllClients}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-gray-100 disabled:opacity-50 sm:self-auto"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
              size={16}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <h2 className="mt-2 text-3xl font-bold">
                  {pagination.totalClients}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FiUsers size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">QR Generated</p>
                <h2 className="mt-2 text-3xl font-bold">
                  {clients.filter((client) => client.hasGeneratedQr).length}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  On the current page
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <FiCheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">All Clients</h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage registered businesses.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search current page..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white sm:w-64"
                />
              </div>

              <select
                value={limit}
                onChange={changeLimit}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                aria-label="Clients per page"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <FiAlertCircle size={18} />
                {error}
              </div>

              <button
                onClick={getAllClients}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Business</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">Place ID</th>
                  <th className="px-5 py-4 font-semibold">QR Status</th>
                  <th className="px-5 py-4 font-semibold">Expiry Date</th>
                  <th className="px-5 py-4 font-semibold">Created At</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Links
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <FiLoader
                          size={28}
                          className="animate-spin text-gray-700"
                        />
                        <span>Loading clients...</span>
                      </div>
                    </td>
                  </tr>
                ) : !error && filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <FiUsers size={32} />
                        <p className="font-medium text-gray-600">
                          {search
                            ? "No matching clients found"
                            : "No clients available"}
                        </p>
                        <p className="text-xs">
                          {search
                            ? "Try a different search term."
                            : "Clients will appear here when registered."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client._id}
                      className="transition hover:bg-gray-50/80"
                    >
                      {/* Business */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 font-semibold uppercase text-gray-600">
                            {(client.businessName || "B").charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {client.businessName || "Unnamed business"}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              ID: {client._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        <a
                          href={`mailto:${client.email}`}
                          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
                        >
                          <FiMail className="shrink-0" size={15} />
                          {client.email || "—"}
                        </a>
                      </td>

                      {/* Place ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiMapPin
                            size={15}
                            className="shrink-0 text-gray-400"
                          />
                          <span
                            className="max-w-[180px] truncate"
                            title={client.placeId || ""}
                          >
                            {client.placeId || "—"}
                          </span>
                        </div>
                      </td>

                      {/* QR Status */}
                      <td className="px-5 py-4">
                        {client.hasGeneratedQr ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                            <FiCheckCircle size={14} />
                            Generated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                            <FiXCircle size={14} />
                            Not generated
                          </span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiCalendar
                            size={15}
                            className="shrink-0 text-gray-400"
                          />
                          <span>{formatDate(client.expiryDate)}</span>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(client.createdAt)}
                      </td>

                      {/* Links */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {client.googleUrl && (
                            <a
                              href={client.googleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Google link"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                              <FiMapPin size={16} />
                            </a>
                          )}

                          {client.savedQrUrl && (
                            <a
                              href={client.savedQrUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open review page"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <FiExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col gap-4 border-t border-gray-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {startItem}–{endItem}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {pagination.totalClients}
              </span>{" "}
              clients
              {search && (
                <span className="ml-1 text-gray-400">
                  · {filteredClients.length} matched on this page
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => changePage(1)}
                disabled={page <= 1 || loading}
                title="First page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronsLeft size={17} />
              </button>

              <button
                onClick={() => changePage(page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                title="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft size={17} />
              </button>

              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => changePage(pageNumber)}
                  disabled={loading}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${
                    page === pageNumber
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() => changePage(page + 1)}
                disabled={!pagination.hasNextPage || loading}
                title="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronRight size={17} />
              </button>

              <button
                onClick={() => changePage(pagination.totalPages)}
                disabled={
                  page >= pagination.totalPages || loading ||
                  pagination.totalPages === 0
                }
                title="Last page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronsRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
