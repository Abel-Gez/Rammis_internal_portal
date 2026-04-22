"use client";

import { useEffect, useState } from "react";
import { getDashboardOverview } from "@/services/dashboard";

export default function useDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getDashboardOverview()
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, []);

  return data;
}