"use client";

import { useEffect, useState } from "react";

type Props = {
  onClose: () => void;
  avatar: string;
  onUpdate?: (data: { avatar?: string }) => void;
};

export default function EditProfile({ onClose, avatar, onUpdate }: Props) {
  // const [editedUsername, setEditedUsername] = useState(username);
  const [editedAvatar, setEditedAvatar] = useState(avatar);

  useEffect(() => {
    setEditedAvatar(avatar);
  }, [avatar]);

  const handleSave = () => {
    // เรียก API เพื่อบันทึกข้อมูล
    if (onUpdate) {
      onUpdate({
        avatar: editedAvatar,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-gray-300">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* MODAL */}
      <div className="relative bg-white w-[400px] rounded-xl shadow-lg p-6">
        <h2 className="text-center text-lg font-semibold text-black mb-4">
          Edit Profile
        </h2>

        {/* AVATAR */}
        <div className="flex flex-col items-center">
          <img
            src={editedAvatar}
            alt="Profile"
            className="w-24 h-24 rounded-full mb-2"
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="w-32 py-2 border rounded-md text-sm hover:bg-gray-100 text-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="w-32 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Save Change
          </button>
        </div>
      </div>
    </div>
  );
}
