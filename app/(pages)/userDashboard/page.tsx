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
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/"); // Redirect to home if there's an error or no user
        return;
      }

      setUser(user); // Set user state only if authenticated
    };

    fetchUser();
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
      <Layout user={user}></Layout>
    </>
  );
};

export default UserDashboard;
