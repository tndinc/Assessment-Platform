"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              className="w-full p-2 border rounded mt-1"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded mt-1"
              value={adminPsw}
              onChange={(e) => setAdminPsw(e.target.value)}
              required
            />
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
