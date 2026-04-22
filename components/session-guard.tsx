"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // sessionStorage is unique to the TAB
    const tabSession = sessionStorage.getItem("tab_session_active");

    if (!tabSession) {
      // If no tab session, clear the cookie (optional) and redirect
      // This forces them to login if they just pasted the URL in a new tab
      router.push("/admin");
    } else {
      setIsVerified(true);
    }
  }, [router]);

  if (!isVerified) return null; // Or a loading spinner

  return <>{children}</>;
}