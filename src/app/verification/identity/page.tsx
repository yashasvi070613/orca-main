"use client";

import React, { useEffect } from "react";
import { useIntelligence } from "@/context/IntelligenceContext";
import DashboardPage from "@/app/dashboard/page";

export default function IdentityVerificationPage() {
  const { setActiveTab } = useIntelligence();

  useEffect(() => {
    setActiveTab("verification-identity");
  }, [setActiveTab]);

  return <DashboardPage />;
}
