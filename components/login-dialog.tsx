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
import { Code, LogIn } from "lucide-react";
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
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900 dark:to-cyan-950 rounded-3xl shadow-2xl border-0">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-center text-blue-700 dark:text-blue-300 font-mono">
            Code Your Future
          </DialogTitle>
          <DialogDescription className="text-blue-600 dark:text-blue-400 text-center text-lg mt-2 font-light">
            Where innovation meets education
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="w-40 h-40 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-600 dark:to-blue-700 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Code className="w-24 h-24 text-white" />
          </div>
          <p className="text-blue-700 dark:text-blue-300 text-center text-lg font-mono">
            {"<div class='future'>You</div>"}
          </p>
          <Button
            variant="outline"
            className={`w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-800 dark:hover:from-blue-800 dark:hover:to-cyan-900 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 ${
              mounted ? "animate-fade-in-up" : "opacity-0"
            }`}
            onClick={login}
          >
            <LogIn className="w-6 h-6" />
            <span>Log in with Google</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
