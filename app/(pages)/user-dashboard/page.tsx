"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Layout } from "./components/Layout";
import LoadingPage from "@/components/Loading"; // Import your custom Loading component

const supabase = createClient();

const UserDashboard = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined); // Initialize as `undefined` to indicate loading
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      // Step 1: Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/"); // Redirect to home if there's an error or no user
        return;
      }

      // Step 2: Fetch the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_section, status")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        router.push("/"); // Handle the error (e.g., redirect to home)
        return;
      }

      // Step 3: Redirect based on profile data
      if (!profile || !profile.user_section) {
        // If `user_section` is not set, redirect to agreements
        router.push("/agreements");
        return;
      }

      if (profile.status === "pending") {
        // If the status is pending, redirect to /confirmation
        router.push("/confirmation");
        return;
      }

      if (profile.status === "rejected") {
        // If the status is rejected, redirect to home or show an appropriate message
        console.error("User status is rejected.");
        router.push("/");
        return;
      }

      // If the status is approved, allow access to the dashboard
      setUser(user);
    };

    fetchUserAndProfile();
  }, [router]);

  // Render the loading page while user authentication state is being determined
  if (user === undefined) {
    return <LoadingPage />;
  }

  // Prevent rendering the dashboard for unauthenticated users
  if (!user) {
    return null;
  }

  return (
    <>
      <Layout />
    </>
  );
};

export default UserDashboard;
