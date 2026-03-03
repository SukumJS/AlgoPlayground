"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
  username: string;
  email: string;
  avatar: string;
  onUpdate?: (data: {
    username?: string;
    avatar?: string;
    name?: string;
  }) => void;
};

export default function EditProfile({
  onClose,
  username,
  email,
  avatar,
  onUpdate,
}: Props) {
  const [editedUsername, setEditedUsername] = useState(username);
  const [editedAvatar, setEditedAvatar] = useState(avatar);
  const [prevProps, setPrevProps] = useState({ username, avatar });

  // อัพเดท state เมื่อ props เปลี่ยน (render-time adjustment)
  if (username !== prevProps.username || avatar !== prevProps.avatar) {
    setPrevProps({ username, avatar });
    setEditedUsername(username);
    setEditedAvatar(avatar);
  }

  const handleFocus = () => {
    if (editedUsername === username) {
      setEditedUsername("");
    }
  };

  const handleSave = () => {
    // เรียก API เพื่อบันทึกข้อมูล
    if (onUpdate) {
      onUpdate({
        username: editedUsername,
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
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => {
              // เปิด dialog สำหรับเลือก/อัพโหลดรูปภาพ
              const newAvatar = prompt("Enter image URL:");
              if (newAvatar) setEditedAvatar(newAvatar);
            }}
          >
            Change Picture
          </button>
        </div>

        {/* FORM */}
        <div className="mt-1 space-y-3">
          <div>
            <label className="text-sm text-gray-600">Username</label>
            <input
              type="text"
              value={editedUsername}
              onChange={(e) => setEditedUsername(e.target.value)}
              onFocus={handleFocus}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full mt-1 px-2 py-2 border rounded-md bg-gray-100 text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed
            </p>
          </div>
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
