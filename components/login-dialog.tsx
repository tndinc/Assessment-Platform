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
      <DialogContent
        className="sm:max-w-[425px] rounded-3xl shadow-2xl border-0
            bg-gradient-to-br from-[#E5E1DA] to-[#948979]/30
            dark:from-[#27374D] dark:to-[#526D82]/30 "
      >
        <DialogHeader>
          <DialogTitle
            className="text-4xl font-bold font-mono text-center 
                text-[#74512D]
                dark:text-[#67C6E3]"
          >
            Code Your Future
          </DialogTitle>
          <DialogDescription
            className="text-center text-lg mt-2 font-light
                text-[#74512D]/80
                dark:text-[#67C6E3]/60"
          >
            Where innovation meets education
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300
              bg-gradient-to-r from-[#948979] to-[#74512D]/20
              dark:from-[#526D82] dark:to-[#67C6E3]/20"
          >
            <Code className="w-24 h-24 text-white" />
          </div>
          <p
            className="text-center text-lg font-mono
              text-[#74512D]
              dark:text-[#67C6E3]"
          >
            {"<div class='future'>You</div>"}
          </p>
          <Button
            variant="outline"
            className={`w-full bg-gradient-to-r border-none shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3
                    from-[#948979]/60 to-[#E5E1DA]/80 hover:from-[#948979] hover:to-[#E5E1DA] text-[#74512D]/70 hover:text-[#74512D]
                    dark:from-[#526D82]/60 dark:to-[#092635]/60 dark:hover:from-[#526D82] dark:hover:to-[#092635] dark:text-[#67C6E3] dark:hover:text-[#67C6E3]/70 ${
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
