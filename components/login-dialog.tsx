"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GraduationCap, LogIn } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const login = async () => {
    try {
      let { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/user-dashboard",
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error during login:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#F1F0E8] hover:bg-[#E5E1DA] dark:bg-[#507687]/40 dark:hover:bg-[#507687]/10 text-gray-800 dark:text-white text-sm md:text-base font-semibold py-2 px-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#092635] rounded-2xl shadow-2xl border-0">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center dark:text-[#67C6E3]">
            Welcome Back!
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 text-center text-lg mt-2">
            Continue your learning journey
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="w-32 h-32 bg-[#B3C8CF] dark:bg-[#526D82] rounded-full flex items-center justify-center shadow-lg">
            <GraduationCap className="w-20 h-20 text-gray-800 dark:text-white" />
          </div>
          <Button
            variant="outline"
            className={`w-full bg-[#B3C8CF] hover:bg-[#89A8B2] dark:bg-[#254B62]/50 dark:hover:bg-[#254B62] text-gray-800 dark:text-white border-none shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 ${
              mounted ? "animate-fade-in-up" : "opacity-0"
            }`}
            onClick={login}
          >
            <LogIn className="w-6 h-6" />
            <span>Login with Google</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
