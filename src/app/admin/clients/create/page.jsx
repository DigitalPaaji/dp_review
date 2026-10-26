
"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FiUserPlus,
  FiMail,
  FiLock,
  FiBriefcase,
  FiMapPin,
  FiLink,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

const Page = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    placeId: "",
    googleUrl: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/admin/clients",
        {
          email: formData.email.trim(),
          password: formData.password,
          businessName: formData.businessName.trim(),
          placeId: formData.placeId.trim(),
          googleUrl: formData.googleUrl.trim(),
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: response.data.message || "Client created successfully!",
        });

        setFormData({
          email: "",
          password: "",
          businessName: "",
          placeId: "",
          googleUrl: "",
        });

        // Optional: redirect after successful creation
        // router.push("/admin/clients");
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to create client.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5";

  return (
    <main className="h-screen overflow-auto bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <FiArrowLeft size={17} />
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
              <FiUserPlus size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Create Client
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Register a new business and configure its review link.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
            <h2 className="font-semibold text-gray-900">
              Client Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the details below to create a client account.
            </p>
          </div>

          <div className="space-y-6 p-5 sm:p-8">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FiMail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  className={`${inputClass} pr-12`}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Password must contain at least 6 characters.
              </p>
            </div>

            <div className="border-t border-gray-100" />

            {/* Business Name */}
            <div>
              <label
                htmlFor="businessName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Business Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FiBriefcase
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  placeholder="e.g. My Restaurant"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Place ID */}
            <div>
              <label
                htmlFor="placeId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Google Place ID
              </label>

              <div className="relative">
                <FiMapPin
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="placeId"
                  name="placeId"
                  type="text"
                  placeholder="ChIJ..."
                  value={formData.placeId}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">
                The unique identifier for the business on Google Maps.
              </p>
            </div>

            {/* Google URL */}
            <div>
              <label
                htmlFor="googleUrl"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Google Review / Maps URL
              </label>

              <div className="relative">
                <FiLink
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="googleUrl"
                  name="googleUrl"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.googleUrl}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Feedback */}
            {message.text && (
              <div
                role="alert"
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
                ) : (
                  <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
                )}

                <p>{message.text}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  email: "",
                  password: "",
                  businessName: "",
                  placeId: "",
                  googleUrl: "",
                })
              }
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Reset Form
            </button>

            <button
              type="submit"
              disabled={loading || formData.password.length < 6}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={17} />
                  Creating Client...
                </>
              ) : (
                <>
                  <FiUserPlus size={17} />
                  Create Client
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-gray-400">
          Fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>
    </main>
  );
};

export default Page;
