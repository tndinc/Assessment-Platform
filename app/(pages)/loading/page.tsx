"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

const supabase = createClient();

export default function loading() {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // stores the authenticated user fetched from supabase ; null - wala pa logged in from the start

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser(); // supabase method to fetch the authenticated user

        setUser(user); // update the user state

        // Check if user's email is equal to the specified email
        if (user && user.email === "tnd.incorporation@gmail.com") {
          setTimeout(() => {
            window.location.href = "/adminDashboard"; // Redirect to ....
          }, 2000); // Redirect after 2 seconds
        } else {
          setTimeout(() => {
            window.location.href = "/userDashboard"; // Redirect to ....
          }, 2000); // Redirect after 2 seconds
        }
      } catch (error) {
        setFetchError("Error fetching user");
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Loading...
      </h1>
      <p className="mt-2 text-muted-foreground">
        Please wait while we set up your account.
      </p>
    </div>
  );
}
