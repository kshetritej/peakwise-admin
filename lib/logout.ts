import { toast } from "sonner";

export const logout = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const res = await fetch(`${baseUrl}/logout`, {
    method: "POST",
    credentials: "include",
    cache: "no-store"
  });

  if (!res.ok) {
    toast.error("Logout failed. Please try again.");
    throw new Error("Failed to logout");
  }
  toast.success("Successfully logged out.");
};
