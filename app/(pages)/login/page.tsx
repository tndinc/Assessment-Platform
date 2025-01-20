"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "./components/header";
import ModernBackground from "../../../components/ui/SchoolBackground";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Book, Pencil, GraduationCap } from "lucide-react";

export const description =
  "An artistic login form for teachers with username and password inside a card. There is also a link to reset the password.";

const Login = () => {
  const [adminUser, setAdminUser] = useState("");
  const [adminPsw, setAdminPsw] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("admin_acc")
      .select("*")
      .eq("admin_user", adminUser)
      .eq("admin_psw", adminPsw)
      .single();

    if (error || !data) {
      setErrorMessage("Invalid username or password");
    } else {
      sessionStorage.setItem("admin_user", adminUser);
      router.push("/admin");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-cyan-900 overflow-hidden">
      <ModernBackground />
      <Header />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-blue-600 dark:text-blue-300">
              Teacher's Portal
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Enter your credentials to access your classroom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-lg font-medium">
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your username"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    required
                    className="pl-10 bg-white/50 dark:bg-gray-700/50 border-blue-300 dark:border-blue-600 focus:border-blue-500 focus:ring-cyan-500"
                  />
                  <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={adminPsw}
                    onChange={(e) => setAdminPsw(e.target.value)}
                    required
                    className="pl-10 bg-white/50 dark:bg-gray-700/50 border-blue-300 dark:border-blue-600 focus:border-blue-500 focus:ring-cyan-500"
                  />
                  <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                </div>
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm text-center">
                  {errorMessage}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-800 dark:hover:from-blue-800 dark:hover:to-cyan-900 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Enter Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
