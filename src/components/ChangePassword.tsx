"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";

// กำหนด Type สำหรับ Props
interface ChangePasswordProps {
  onClose: () => void;
}

export default function ChangePassword({ onClose }: ChangePasswordProps) {
  // สร้าง State สำหรับเก็บค่ารหัสผ่าน
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State สำหรับการซ่อน/แสดงรหัสผ่าน
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ฟังก์ชัน Handle Input Change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชัน Submit
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submit Data:", formData);
    //เรียก API สำหรับเปลี่ยนรหัสผ่านที่นี่
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-gray-300">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Change Password
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Current Password */}
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={formData.currentPassword}
            placeholder="Current Password"
            isVisible={showPass.current}
            onChange={handleChange}
            toggleVisible={() =>
              setShowPass((p) => ({ ...p, current: !p.current }))
            }
          />

          {/* New Password */}
          <PasswordField
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            placeholder="New Password"
            isVisible={showPass.new}
            onChange={handleChange}
            toggleVisible={() => setShowPass((p) => ({ ...p, new: !p.new }))}
          />

          {/* Confirm New Password */}
          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Confirm New Password"
            isVisible={showPass.confirm}
            onChange={handleChange}
            toggleVisible={() =>
              setShowPass((p) => ({ ...p, confirm: !p.confirm }))
            }
          />

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-40 py-2 border rounded-md text-sm hover:bg-gray-100 text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-40 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  isVisible: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  toggleVisible: () => void;
}

const PasswordField = ({
  label,
  name,
  value,
  placeholder,
  isVisible,
  onChange,
  toggleVisible,
}: PasswordFieldProps) => (
  <div>
    <label className="block text-gray-600 mb-1.5 font-medium text-sm">
      {label}
    </label>
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black transition-all"
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        onClick={toggleVisible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      ></button>
    </div>
  </div>
);
