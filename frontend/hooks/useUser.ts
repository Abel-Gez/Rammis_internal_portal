import { useEffect, useState } from "react"
import api from "@/services/api"
import { User } from "@/types/user"

export function useUser() {
   const [user, setUser] = useState<any>(undefined); 

  useEffect(() => {
    api.get("/auth/me/")
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
  }, [])

  return user
}