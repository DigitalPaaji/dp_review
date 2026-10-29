
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import LeftHeroPanel from "./components/LeftHeroPanel";
import ClientLogin from "./components/ClientLogin";
import AdminLogin from "./components/AdminLogin";

export default function PortalApp() {
  const [viewMode, setViewMode] = useState("client-login");

  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientLoginError, setClientLoginError] = useState("");

  const router = useRouter();

  const handleClientLogin = async (e) => {
    e.preventDefault();
    setClientLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: clientEmail,
          password: clientPassword,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setClientLoginError(
          data?.message || "Unable to log in."
        );
        return;
      }

      router.push("/client");
    } catch {
      setClientLoginError(
        "Connection error. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#090D16] font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">

        {/* Left Hero Section */}
        <section className="hidden min-h-screen lg:block">
          <LeftHeroPanel />
        </section>

        {/* Login Section */}
        <section className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-8 text-slate-900 sm:px-8 md:px-12 lg:px-10 xl:px-16">
          <div className="my-auto flex w-full max-w-xl flex-col justify-center">

            {/* Mobile Brand / Heading */}
            <div className="mb-8 text-center lg:hidden">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                Sign in to access your portal.
              </p>
            </div>

            {viewMode === "client-login" && (
              <ClientLogin
                clientEmail={clientEmail}
                setClientEmail={setClientEmail}
                clientPassword={clientPassword}
                setClientPassword={setClientPassword}
                handleClientLogin={handleClientLogin}
                clientLoginError={clientLoginError}
                setViewMode={setViewMode}
              />
            )}

            {viewMode === "admin-login" && (
              <AdminLogin setViewMode={setViewMode} />
            )}

          </div>
        </section>

      </div>
    </main>
  );
}
