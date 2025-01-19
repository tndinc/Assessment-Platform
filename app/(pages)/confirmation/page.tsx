"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import StudentWaitingPage from "./components/StudentWaitingPage";
import LoadingPage from "@/components/Loading"; // Import your custom Loading component

const supabase = createClient();

const WaitingPage = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined); // Initialize as undefined to indicate loading
  const router = useRouter();

  useEffect(() => {
    let subscription: any;

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
        router.push("/agreements");
        return;
      }

      // If the status is still pending, show the waiting page
      if (profile.status === "pending") {
        setUser(user);
      } else if (profile.status === "approved") {
        router.push("/user-dashboard");
        return;
      } else if (profile.status === "rejected") {
        router.push("/");
        return;
      }

      // Step 4: Set up real-time subscription to listen for status changes
      subscription = supabase
        .channel("realtime:profiles")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const updatedProfile = payload.new;

            // React to status changes
            if (updatedProfile.status === "approved") {
              setUser(user); // Allow access to the dashboard
              router.push("/user-dashboard");
            } else if (updatedProfile.status === "rejected") {
              router.push("/"); // Handle rejected status
            } else if (updatedProfile.status === "pending") {
              setUser(user); // Stay on waiting page
            }
          }
        )
        .subscribe();
    };

    fetchUserAndProfile();

    // Cleanup subscription on component unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [router]);

  // Render the loading page while user authentication state is being determined
  if (user === undefined) {
    return <LoadingPage />;
  }

  // Prevent rendering the waiting page for unauthenticated users
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Show the waiting page if status is pending */}
      <StudentWaitingPage />
    </>
  );
};

export default WaitingPage;
