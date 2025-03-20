"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AddItemModal from "../components/AddItemModal";
import Link from "next/link";
import ItemCard from "../components/ItemCard";

export default function Wardrobe() {
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.access_token) {
      router.push("/");
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
      <Link href="/Wardrobe" className="text-lg font-bold mb-2 hover:cursor-pointer">Wardrobe</Link>
      {/* Tops Section */}
      <div className="mb-8">
        <h1 className="text-lg font-bold mb-2">Outerware:</h1>
        <div className="flex space-x-4">
          <ItemCard itemType="outerware"/>
        </div>
      </div>
      {/* Render the Modal */}
      {modalOpen && (
        <div ref={modalRef}>
          <AddItemModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
        </div>
      )}
    </div>
  );
}
