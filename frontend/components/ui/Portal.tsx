"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children directly into document.body, completely bypassing any
 * CSS stacking contexts, overflow containers, or backdrop-filter ancestors
 * in the portal layout. Use this to wrap any fixed-position modal overlay.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
