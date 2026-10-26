"use client";
import React, { useState, useEffect } from "react";
import LeftHeroPanel from "./components/LeftHeroPanel";
import ClientLogin from "./components/ClientLogin";
import AdminLogin from "./components/AdminLogin";

import { useRouter } from "next/navigation";

export default function PortalApp() {
  const [viewMode, setViewMode] = useState("client-login");
 
  const routes = useRouter()
  


  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientLoginError, setClientLoginError] = useState("");


 

  const handleClientLogin = async (e) => {
    e.preventDefault();
    setClientLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clientEmail,
          password: clientPassword,
        }),
        credentials:"include"
      });   

      const data = await res.json();

      if (!res.ok || !data.success) {
        setClientLoginError(data?.message || "Unable to log in.");
        return;
      }
   routes.push("/client")

    } catch {
      setClientLoginError("Connection error. Please try again.");
    }
  };

  

  return (
    <div className="w-screen overflow-hidden  grid grid-cols-2  font-sans bg-[#090D16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <LeftHeroPanel />

      <div className="w-full  h-screen flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-6 overflow-y-auto bg-white text-slate-900 shadow-2xl">
        <div className="w-full max-w-xl mx-auto flex flex-col justify-center my-auto">
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

         {/*   {viewMode === "admin-dashboard" && (
            <AdminDashboard
              clientsList={clientsList}
              setClientsList={setClientsList}
              setViewMode={setViewMode}
              handleLogout={handleLogout}
            />
          )}

          {viewMode === "client-dashboard" && currentClient && (
            <ClientDashboard
              currentClient={currentClient}
              setCurrentClient={setCurrentClient}
              setViewMode={setViewMode}
              handleLogout={handleLogout}
              handleClientGenerateQr={handleClientGenerateQr}
              handleCopy={handleCopy}
              copied={copied}
            />
          )} */}
        </div>
      </div>
    </div>
  );
}

