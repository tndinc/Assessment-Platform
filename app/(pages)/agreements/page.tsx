"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AgreementsAndTerms from "./components/aggreements"; // Assuming the component is here
import LoadingPage from "@/components/Loading"; // Assuming you have a LoadingPage componen"t

const supabase = createClient();

const AgreementsAndTermsPage = () => {
  const [user, setUser] = useState<any | null | undefined>(undefined); // User state
  const [userSection, setUserSection] = useState<any | null>(null); // User section state
  const [loading, setLoading] = useState(true); // Loading state to manage the rendering
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      // Fetch the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Authentication error or no user:", authError);
        router.push("/"); // Redirect to home if not authenticated
        return;
      }

      // Set the user state if authentication is successful
      setUser(user);

      // Step 2: Fetch the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_section")
        .eq("id", user.id) // Assuming `id` is the primary key that links profiles to auth users
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        router.push("/"); // Handle the error (e.g., redirect to home)
        return;
      }

      // Step 3: Check if `user_section` exists in the profile
      if (profile && profile.user_section) {
        setUserSection(profile.user_section); // Set user_section if it exists
      }

      // Once the data is fetched and checked, stop loading
      setLoading(false);
    };

    fetchUserAndProfile();
  }, [router]);

  // Render the loading page while user authentication state is being determined
  if (loading) {
    return <LoadingPage />;
  }

  // If there's no user, return null (you can also redirect here if necessary)
  if (!user) {
    return null;
  }

  // If `user_section` exists, redirect to `/userDashboard`
  if (userSection) {
    router.push("/user-dashboard");
    return null; // Prevent rendering anything else after redirection
  }

  // If `user_section` doesn't exist, render the Agreements and Terms page
  return <AgreementsAndTerms />;
};

export default AgreementsAndTermsPage;
