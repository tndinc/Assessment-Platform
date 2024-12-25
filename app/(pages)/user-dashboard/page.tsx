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
        .select("user_section")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        router.push("/"); // Handle the error (e.g., redirect to home)
        return;
      }

      // Step 3: Check if `user_section` is null and redirect
      if (!profile || !profile.user_section) {
        router.push("/agreements");
        return;
      }

      setUser(user); // Set the user state only if everything is valid
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
