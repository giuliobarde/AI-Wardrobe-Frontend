import React from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemId: string;
  outfitCount: number;
  onConfirm: (itemId: string) => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemId,
  outfitCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Delete Item</h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete this item? It is in {outfitCount}{" "}
          {outfitCount === 1 ? "outfit" : "outfits"}. By deleting it, you would
          delete {outfitCount === 1 ? "this outfit" : "these outfits"} too.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(itemId)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
