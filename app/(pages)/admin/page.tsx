"use client";
import { useEffect, useState } from "react";
import { AdminDashboard } from "./dashboard/page";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import LoadingPage from "../../../components/Loading";

const AdminPages = () => {
  const [adminUser, setAdminUser] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem("admin_user");
    if (!loggedInUser) {
      // Redirect to login if no admin_user in sessionStorage
      router.push("/login");
    } else {
      // Set the adminUser from sessionStorage
      console.log(loggedInUser);
      setAdminUser(loggedInUser);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <LoadingPage />;
  }

  return <AdminDashboard />;
};

export default AdminPages;
