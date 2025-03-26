"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";
import { getAllUserItems } from "@/app/services/wardrobeService";

interface ClothingItem {
  id: string;
  added_date?: string;
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [recentItems, setRecentItems] = useState<ClothingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState("");

  // States for editing profile info.
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/");
    }
  }, [user, router]);

  // Update form fields when user data changes.
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setUsername(user.username ?? "");
    }
  }, [user]);

  // Fetch the last few added items for the user.
  useEffect(() => {
    async function fetchRecentItems() {
      setLoadingItems(true);
      setItemsError("");
      try {
        const data = await getAllUserItems(user?.access_token as string);
        // Assuming response is { data: [...] } sorted by added_date descending.
        setRecentItems(data.data.slice(0, 4));
      } catch (err: any) {
        console.error(err);
        setItemsError("Failed to load recent items.");
      }
      setLoadingItems(false);
    }
    if (user?.access_token) {
      fetchRecentItems();
    }
  }, [user]);

  // Handler for saving updated profile info.
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError("");
    try {
      const res = await fetch("http://localhost:8000/update_profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username: username,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }
      const updatedUserResponse = await res.json();
      // Update global user state with the new profile.
      setUser(updatedUserResponse.data);
      setEditing(false);
      router.refresh();
    } catch (error: any) {
      setUpdateError(error.message);
    }
    setUpdating(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setUsername(user?.username ?? "");
    setUpdateError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          User Profile
        </h1>
        {/* Profile Information */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              {updateError && <p className="text-red-500 text-center">{updateError}</p>}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {updating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>Username:</strong> {user?.username}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Gender:</strong> {user?.gender}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Member Since:</strong> {user?.member_since}
              </p>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </div>

        {/* Recent Additions Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Recent Additions</h2>
          {recentItems.length === 0 ? (
            <div className="flex flex-col items-center">
              <p className="text-center text-gray-600 mb-4">
                You haven't added any items yet. Click below to add your first item!
              </p>
              <AddItem />
            </div>
          ) : (
            <div className="flex gap-4 justify-center items-center">
              {recentItems.map((item) => (
                <ItemCard key={item.id} itemId={item.id} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/Wardrobe"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition transform hover:scale-105"
          >
            Back to Wardrobe
          </Link>
        </div>
      </div>
    </div>
  );
}
