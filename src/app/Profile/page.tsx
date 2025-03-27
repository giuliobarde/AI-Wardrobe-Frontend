"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { updateProfile } from "@/app/services/userService";
import { getAllUserItems } from "@/app/services/wardrobeService";
import ItemCard from "../components/ItemCard";
import AddItem from "../components/AddItem";

interface ClothingItem {
  id: string;
  added_date?: string;
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  // States for editing profile info.
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);

  // States for recent items.
  const [recentItems, setRecentItems] = useState<ClothingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState("");

  // Redirect if user is not signed in.
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

  // Fetch recent items.
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
      const updatedResponse = await updateProfile(
        user?.access_token as string,
        firstName,
        lastName,
        username
      );
      // Merge updated fields with existing user state.
      setUser((prev) => ({ ...prev, ...updatedResponse.data }));
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
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              My Profile
            </h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center text-purple-600 hover:text-purple-700 transition"
                title="Edit Profile"
              >
                {/* Pen Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-2.036a2.5 2.5 0 113.536 3.536L10 21H4v-6L16.732 3.732z"
                  />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
          </div>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              {updateError && (
                <p className="text-red-500 text-center text-sm">{updateError}</p>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  {updating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-600">
                <span className="font-medium">Username:</span> {user?.username}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              {user?.gender && (
                <p className="text-gray-600">
                  <span className="font-medium">Gender:</span> {user?.gender}
                </p>
              )}
              {user?.member_since && (
                <p className="text-gray-600">
                  <span className="font-medium">Member Since:</span> {user?.member_since}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent Items Card */}
        <div className="bg-white shadow-xl rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Recent Items
            </h2>
          </div>
          {loadingItems ? (
            <p className="text-center text-gray-600">Loading recent items...</p>
          ) : itemsError ? (
            <p className="text-center text-red-500 text-sm">{itemsError}</p>
          ) : recentItems.length === 0 ? (
            <div className="flex flex-col items-center">
              <p className="text-center text-gray-600 mb-4">
                You haven't added any items yet.
              </p>
              <AddItem />
            </div>
          ) : (
            <div className="flex flex-row gap-6 overflow-x-auto">
              {recentItems.map((item) => (
                <ItemCard key={item.id} itemId={item.id} />
              ))}
            </div>
          )}
        </div>

        {/* Navigation Button */}
        <div className="mt-6 text-center">
          <Link
            href="/Wardrobe"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition transform hover:scale-105"
          >
            Back to Wardrobe
          </Link>
        </div>
      </div>
    </div>
  );
}
