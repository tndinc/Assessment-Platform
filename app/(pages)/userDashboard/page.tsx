"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Layout } from "./components/Layout";
const supabase = createClient();

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
        console.log("Fetched user:", user); // Debugging: log the user object to check its contents

        if (error) {
          console.error("Error fetching user:", error.message);
          setFetchError("Error fetching user");
        }

        setUser(user); // Set the user state if the user data is available
      } catch (error) {
        setFetchError("Error fetching user");
        console.error("Unexpected error fetching user:", error); // Log any unexpected errors
      }
    };

    fetchUser();
  }, []);
  return (
    <>
      <Layout user={user}></Layout>
    </>
  );
};

export default AdminDashboard;
