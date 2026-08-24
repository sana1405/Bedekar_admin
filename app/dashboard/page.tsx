"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardApp from "../screens/DashboardApp";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && (!window.localStorage.getItem("aurelia_admin_token") || window.localStorage.getItem("aurelia_admin_role") !== "admin")) {
      router.replace("/login");
    }
  }, [router]);

  return <DashboardApp />;
}
