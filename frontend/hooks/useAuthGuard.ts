"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./useUser";
import { User } from "@/types/user";

export default function useAuthGuard(
  requiredPermission?: string
): User | null | undefined {

  const user = useUser();
  const router = useRouter();

  useEffect(() => {

    if (user === undefined) return;

    if (user === null) {
      router.replace("/login");
      return;
    }

    // ✅ SAFE PERMISSIONS HANDLING
    const permissions = user.permissions || [];

    if (
      requiredPermission &&
      !permissions.includes(requiredPermission)
    ) {
      console.log(`User lacks permission: ${requiredPermission}`);
      // router.push("/dashboard");
    }

  }, [user, router, requiredPermission]);

  return user;
}