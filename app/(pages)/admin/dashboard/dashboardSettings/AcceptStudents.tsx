"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "../../../../../components/Loading";
import Image from "next/image"; // For rendering the avatar images

const supabase = createClient();

interface Profile {
  id: string; // UUID
  full_name: string;
  email: string;
  avatar_url: string;
  user_section: string;
  status: string; // pending, approved, or rejected
}

const ManageProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const profilesPerPage = 10;

  // Fetch profiles with status "pending"
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, user_section, status")
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching profiles:", error);
      } else {
        setProfiles(data);
        setFilteredProfiles(data); // Set initially filtered profiles
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  // Handle search query change
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = profiles.filter(
      (profile) =>
        profile.full_name.toLowerCase().includes(lowerCaseQuery) ||
        profile.email.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredProfiles(filtered);
    setCurrentPage(1); // Reset to the first page when filtering
  }, [searchQuery, profiles]);

  // Handle accept profile (update status to "approved")
  const handleAccept = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      console.error("Error accepting profile:", error);
    } else {
      setProfiles((prevProfiles) =>
        prevProfiles.filter((profile) => profile.id !== id)
      );
    }
  };

  // Handle reject profile (update status to "rejected")
  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      console.error("Error rejecting profile:", error);
    } else {
      setProfiles((prevProfiles) =>
        prevProfiles.filter((profile) => profile.id !== id)
      );
    }
  };

  if (loading) return <Loading />;

  // Pagination
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = filteredProfiles.slice(
    indexOfFirstProfile,
    indexOfLastProfile
  );

  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Manage Profiles</h1>
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Profiles</CardTitle>
          <CardDescription>
            Approve or reject student profiles waiting for confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProfiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {/* Avatar */}
                  <TableCell>
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300" />
                    )}
                  </TableCell>

                  {/* Full Name */}
                  <TableCell className="font-medium">
                    {profile.full_name}
                  </TableCell>

                  {/* Email */}
                  <TableCell>{profile.email}</TableCell>

                  {/* User Section */}
                  <TableCell>{profile.user_section}</TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAccept(profile.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(profile.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="pt-6">
          <div className="flex justify-between w-full text-xs text-muted-foreground">
            <div>
              Total Pending Profiles: <strong>{filteredProfiles.length}</strong>
            </div>
            {/* Pagination Controls */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default ManageProfiles;
