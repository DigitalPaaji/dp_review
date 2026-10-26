"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiMail,
  FiPhone,
  FiExternalLink,
  FiInbox,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiUser,
  FiBriefcase,
  FiPhoneCall,
  FiLoader,
} from "react-icons/fi";

const DEFAULT_PAGINATION = {
  currentPage: 1,
  limit: 10,
  totalRequests: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const STATUSES = ["pending", "contacted", "approved", "rejected"];

const statusStyles = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: <FiClock />,
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: <FiPhoneCall />,
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: <FiCheckCircle />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 ring-red-200",
    icon: <FiXCircle />,
  },
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const getStatus = (status) => {
  const key = status?.toLowerCase() || "pending";

  return (
    statusStyles[key] || {
      label: status || "Unknown",
      className: "bg-slate-100 text-slate-700 ring-slate-200",
      icon: <FiClock />,
    }
  );
};

export default function AccountRequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const [page, setPage] = useState(
    Math.max(1, Number(searchParams.get("page")) || 1)
  );

  const [limit, setLimit] = useState(
    [10, 20, 50].includes(Number(searchParams.get("limit")))
      ? Number(searchParams.get("limit"))
      : 10
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/api/admin/accountrequest", {
        params: { page, limit },
      });

      const result = response.data;

      if (!result.success) {
        throw new Error("Unable to fetch account requests.");
      }

      setRequests(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load account requests."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));
    params.set("limit", String(limit));

    const query = params.toString();
    const currentQuery = searchParams.toString();

    if (query !== currentQuery) {
      router.replace(`?${query}`, { scroll: false });
    }

    fetchRequests();
  }, [page, limit, fetchRequests, router, searchParams]);

  // Update request status.
  // Assumed endpoint: PATCH /api/admin/accountrequest/:id
  const updateStatus = async (requestId, newStatus) => {
    const previousRequests = requests;

    try {
      setUpdatingId(requestId);
      setUpdateError("");

      // Optimistic UI update
      setRequests((current) =>
        current.map((request) =>
          request._id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );

      setSelectedRequest((current) =>
        current?._id === requestId
          ? { ...current, status: newStatus }
          : current
      );

      const response = await axios.patch(
        `/api/admin/accountrequest/${requestId}`,
        { status: newStatus }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Failed to update request status."
        );
      }

      // Use the returned updated request if the API provides it.
      const updatedRequest =
        response.data?.data &&
        !Array.isArray(response.data.data) &&
        response.data.data._id
          ? response.data.data
          : null;

      if (updatedRequest) {
        setRequests((current) =>
          current.map((request) =>
            request._id === requestId
              ? { ...request, ...updatedRequest }
              : request
          )
        );

        setSelectedRequest((current) =>
          current?._id === requestId
            ? { ...current, ...updatedRequest }
            : current
        );
      }
    } catch (err) {
      setRequests(previousRequests);

      setSelectedRequest((current) => {
        if (!current || current._id !== requestId) return current;

        const previous = previousRequests.find(
          (request) => request._id === requestId
        );

        return previous ? { ...current, status: previous.status } : current;
      });

      setUpdateError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      [
        request.contactName,
        request.businessName,
        request.email,
        request.phone,
        request.location,
        request.status,
      ].some((value) => value?.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "all" ||
      request.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;

  const contactedCount = requests.filter(
    (item) => item.status?.toLowerCase() === "contacted"
  ).length;

  const approvedCount = requests.filter(
    (item) => item.status?.toLowerCase() === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (item) => item.status?.toLowerCase() === "rejected"
  ).length;

  const stats = [
    {
      title: "Total Requests",
      value: pagination.totalRequests,
      icon: <FiInbox />,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: <FiClock />,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Contacted",
      value: contactedCount,
      icon: <FiPhoneCall />,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Approved",
      value: approvedCount,
      icon: <FiCheckCircle />,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Rejected",
      value: rejectedCount,
      icon: <FiXCircle />,
      color: "bg-red-50 text-red-700",
    },
  ];

  const changePage = (nextPage) => {
    setPage(
      Math.max(1, Math.min(nextPage, pagination.totalPages || 1))
    );
  };

  const handleLimitChange = (value) => {
    setLimit(Number(value));
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Admin Dashboard
              <span className="text-slate-300">/</span>
              Account Requests
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Account Requests
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and review business account registration requests.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  {stat.title}
                </p>

                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {loading ? "—" : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-bold">All Requests</h2>
              <p className="mt-1 text-sm text-slate-500">
                {pagination.totalRequests} registration requests found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search requests..."
                  aria-label="Search requests"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                <option value="all">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusStyles[status].label}
                  </option>
                ))}
              </select>

              <select
                value={limit}
                onChange={(e) => handleLimitChange(e.target.value)}
                aria-label="Requests per page"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Status update error */}
          {updateError && (
            <div className="m-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <span>{updateError}</span>
              <button
                type="button"
                onClick={() => setUpdateError("")}
                className="ml-auto font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Fetch error */}
          {error && (
            <div className="m-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />
                <span>{error}</span>
              </div>

              <button
                type="button"
                onClick={fetchRequests}
                className="self-start font-semibold underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="space-y-4 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                  <div className="h-7 w-20 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : !error && filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl text-slate-400">
                <FiInbox />
              </div>

              <h3 className="mt-4 font-bold">
                {search || statusFilter !== "all"
                  ? "No matching requests"
                  : "No requests yet"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search || statusFilter !== "all"
                  ? "Try changing your search or status filter."
                  : "New business account requests will appear here."}
              </p>

              {(search || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Business / Contact</th>
                      <th className="px-5 py-4">Contact Details</th>
                      <th className="px-5 py-4">Location</th>
                      <th className="px-5 py-4">Date Submitted</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Update Status</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((request) => {
                      const status = getStatus(request.status);
                      const isUpdating = updatingId === request._id;

                      return (
                        <tr
                          key={request._id}
                          className="transition hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-700">
                                {request.businessName?.charAt(0)?.toUpperCase() || (
                                  <FiBriefcase />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[200px] truncate text-sm font-semibold text-slate-900">
                                  {request.businessName || "Unnamed business"}
                                </p>

                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                  <FiUser className="shrink-0" />
                                  <span className="max-w-[170px] truncate">
                                    {request.contactName || "No contact name"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <a
                              href={`mailto:${request.email}`}
                              className="flex max-w-[220px] items-center gap-2 text-sm text-slate-600 hover:text-emerald-700"
                            >
                              <FiMail className="shrink-0 text-slate-400" />
                              <span className="truncate">
                                {request.email || "—"}
                              </span>
                            </a>

                            <a
                              href={`tel:${request.phone}`}
                              className="mt-2 flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-700"
                            >
                              <FiPhone className="shrink-0" />
                              {request.phone || "—"}
                            </a>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FiMapPin className="shrink-0 text-slate-400" />
                              <span className="max-w-[140px] truncate">
                                {request.location || "—"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                              {formatDate(request.createdAt)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {request.createdAt
                                ? new Date(request.createdAt).toLocaleTimeString(
                                    "en-IN",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${status.className}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </td>

                          {/* Editable status */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={STATUSES.includes(
                                  request.status?.toLowerCase()
                                )
                                  ? request.status.toLowerCase()
                                  : "pending"}
                                disabled={isUpdating}
                                onChange={(e) =>
                                  updateStatus(request._id, e.target.value)
                                }
                                aria-label={`Update status for ${request.businessName}`}
                                className="max-w-[150px] rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 disabled:opacity-60"
                              >
                                {STATUSES.map((item) => (
                                  <option key={item} value={item}>
                                    {statusStyles[item].label}
                                  </option>
                                ))}
                              </select>

                              {isUpdating && (
                                <FiLoader className="animate-spin text-emerald-700" />
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(request)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                            >
                              View details
                              <FiExternalLink />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-800">
                    {pagination.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {Math.max(1, pagination.totalPages)}
                  </span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="font-medium text-slate-700">
                    {pagination.totalRequests}
                  </span>{" "}
                  total requests
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPrevPage || loading}
                    onClick={() => changePage(page - 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiChevronLeft />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => changePage(page + 1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Details modal */}
        {selectedRequest && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="request-detail-title"
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Account Request Details
                  </p>

                  <h2
                    id="request-detail-title"
                    className="mt-2 text-xl font-bold"
                  >
                    {selectedRequest.businessName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Submitted {formatDateTime(selectedRequest.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                {[
                  {
                    label: "Contact Name",
                    value: selectedRequest.contactName,
                    icon: <FiUser />,
                  },
                  {
                    label: "Business Name",
                    value: selectedRequest.businessName,
                    icon: <FiBriefcase />,
                  },
                  {
                    label: "Email Address",
                    value: selectedRequest.email,
                    icon: <FiMail />,
                  },
                  {
                    label: "Phone Number",
                    value: selectedRequest.phone,
                    icon: <FiPhone />,
                  },
                  {
                    label: "Location",
                    value: selectedRequest.location,
                    icon: <FiMapPin />,
                  },
                  {
                    label: "Submitted On",
                    value: formatDateTime(selectedRequest.createdAt),
                    icon: <FiClock />,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      {item.icon}
                      {item.label}
                    </div>

                    <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                      {item.value || "—"}
                    </p>
                  </div>
                ))}

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <FiMessageSquare />
                    Message
                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {selectedRequest.message || "No message provided."}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
                  <p className="mb-3 text-xs font-medium text-slate-500">
                    Update Request Status
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-inset ${getStatus(selectedRequest.status).className}`}
                    >
                      {getStatus(selectedRequest.status).icon}
                      {getStatus(selectedRequest.status).label}
                    </span>

                    <select
                      value={STATUSES.includes(
                        selectedRequest.status?.toLowerCase()
                      )
                        ? selectedRequest.status.toLowerCase()
                        : "pending"}
                      disabled={updatingId === selectedRequest._id}
                      onChange={(e) =>
                        updateStatus(selectedRequest._id, e.target.value)
                      }
                      aria-label="Update request status"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 disabled:opacity-60"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusStyles[status].label}
                        </option>
                      ))}
                    </select>

                    {updatingId === selectedRequest._id && (
                      <FiLoader className="animate-spin text-emerald-700" />
                    )}
                  </div>

                  {selectedRequest.googleUrl && (
                    <a
                      href={selectedRequest.googleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex w-fit items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      Open Google Business Link
                      <FiExternalLink />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 p-5">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
