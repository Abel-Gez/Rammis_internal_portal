"use client";

import { useEffect, useState } from "react";
import { getQuickLinks } from "@/services/quickLinks";

export default function useQuickLinks() {

  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    getQuickLinks()
      .then(setLinks)
      .catch(console.error);
  }, []);

  return links;
}