"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import ItemModal from "../components/AddItemModal";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function Wardrobe() {
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/Login");
    }
  }, [user, router]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false);
      }
    }

    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  return (
    <div className="py-20 px-4">
      {/* Tops Section */}
      <div className="mb-8">
        <Link href="/Tops" className="text-lg font-bold mb-2 hover:cursor-pointer">Tops</Link>
        <div className="flex space-x-4 overflow-x-auto">
          {/* Add Item Card */}
          <div
            onClick={() => setModalOpen(true)}
            className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
          >
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Bottoms Section */}
      <div className="mb-8">
        <Link href="/Bottoms" className="text-lg font-bold mb-2 hover:cursor-pointer">Bottoms</Link>
        <div className="flex space-x-4 overflow-x-auto">
          {/* Add Item Card */}
          <div
            onClick={() => setModalOpen(true)}
            className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
          >
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Shoes Section */}
      <div className="mb-8">
        <Link href="/Shoes" className="text-lg font-bold mb-2 hover:cursor-pointer">Shoes</Link>
        <div className="flex space-x-4 overflow-x-auto">
          {/* Add Item Card */}
          <div
            onClick={() => setModalOpen(true)}
            className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
          >
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Outerware Section */}
      <div className="mb-8">
        <Link href="/Outerware" className="text-lg font-bold mb-2 hover:cursor-pointer">Outerware</Link>
        <div className="flex space-x-4 overflow-x-auto">
          {/* Add Item Card */}
          <div
            onClick={() => setModalOpen(true)}
            className="min-w-[150px] h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
          >
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Render the Modal */}
      {modalOpen && (
        <div ref={modalRef}>
          <ItemModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
        </div>
      )}
    </div>
  );
}
