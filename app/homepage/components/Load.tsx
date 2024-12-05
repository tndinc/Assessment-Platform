import supabase from "@/supabase";
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react'

export default function Load() {

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        // Check if user's email is equal to the specified email
        if (user && user.email === 'emmanuellemanuel@gmail.com') {
          setTimeout(() => {
            window.location.href = '/dashboard'; // Redirect to /dashboard
          }, 2000); // Redirect after 2 seconds
        } else {
          setTimeout(() => {
            window.location.href = '/adashboard'; // Redirect to /adashboard
          }, 2000); // Redirect after 2 seconds
        }
      } catch (error) {
        setFetchError('Error fetching user');
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
  )
}

