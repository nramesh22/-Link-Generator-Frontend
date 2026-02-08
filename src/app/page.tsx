"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="dashboard-shell fade-in">
      <header className="dash-top">
        <div className="dash-logo">
          <img className="app-logo" src="/mylogo.png" alt="Link Generator logo" />
        </div>
      </header>
    </main>
  );
}
