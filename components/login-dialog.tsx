"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChromeIcon as Google } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const login = async () => {
    // handling user authentication with google
    try {
      // try catch block for d process
      let { data, error } = await supabase.auth.signInWithOAuth({
        // redirect eme eme
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000//loading",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white dark:bg-gray-800 text-sm md:text-base"
        >
          Log In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white text-lg md:text-xl">
            Log in to your account
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            Choose your preferred login method below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          <Button
            variant="outline"
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
            onClick={login}
          >
            <Google className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Login with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
