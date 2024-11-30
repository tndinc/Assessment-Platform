"use client";

import { useEffect, useState } from "react";
import supabase from "@/components/supabase";
import { User } from "@supabase/supabase-js";
import UserInfo from "@/components/UserInfo"; // Import UserInfo component

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        console.log("Fetched user:", user);  // Debugging: log the user object to check its contents

        if (error) {
          console.error("Error fetching user:", error.message);
          setFetchError("Error fetching user");
        }

        setUser(user);  // Set the user state if the user data is available
      } catch (error) {
        setFetchError("Error fetching user");
        console.error("Unexpected error fetching user:", error);  // Log any unexpected errors
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-foreground mt-4"> DI KA ADMIN BEH</h1>

      {/* Display User Info */}
      <UserInfo user={user} />

      {/* Other admin dashboard content */}
      <p className="mt-4 text-muted-foreground">
        You can manage users and settings here.
      </p>
    </div>
  );
};

export default AdminDashboard;
