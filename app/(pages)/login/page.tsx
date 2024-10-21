"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export const description =
  "A login form for admins with username and password inside a card. There is also a link to reset the password.";

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
      .single(); // Select a single matching row

    if (error || !data) {
      setErrorMessage("Invalid username or password");
    } else {
      // Store admin_user in localStorage/sessionStorage to manage session manually
      sessionStorage.setItem("admin_user", adminUser);

      // Redirect to dashboard after successful login
      router.push("/admin");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin username"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="your password"
                  value={adminPsw}
                  onChange={(e) => setAdminPsw(e.target.value)}
                  required
                />
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
              )}
              <Button type="submit" className="w-full">
                Log In
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Forgot your password?{" "}
            <Link href="/reset-password" className="underline">
              Reset it here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
