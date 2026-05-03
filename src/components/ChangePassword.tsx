"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  signOut,
} from "firebase/auth";

interface ChangePasswordProps {
  onClose: () => void;
}

export default function ChangePassword({ onClose }: ChangePasswordProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState<string>("");
  // ⭐️ 1. เพิ่ม State สำหรับเก็บข้อความสำเร็จ
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMsg(""); // ล้างข้อความสำเร็จเก่า

    const { currentPassword, newPassword, confirmPassword } = formData;

    // Validate เบื้องต้น
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        throw new Error("User not found. Please log in again.");
      }

      // Re-authenticate with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update to new password
      await updatePassword(user, newPassword);

      // ⭐️ 2. เซ็ตข้อความสำเร็จแทนการใช้ alert
      setSuccessMsg("Password changed successfully. Redirecting to login...");

      // ⭐️ 3. หน่วงเวลา 2 วินาทีก่อนเตะไปหน้า Login เพื่อให้อ่านข้อความทัน
      setTimeout(async () => {
        await signOut(auth);
        window.location.href = "/auth/signin";
      }, 2000);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Incorrect current password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(
          err.message || "An error occurred while changing the password.",
        );
      }
      setLoading(false); // ปิด loading เฉพาะตอนมี Error (ถ้าสำเร็จเราจะให้โหลดค้างไว้จนกว่าจะย้ายหน้า)
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-gray-300">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Change Password
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

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

          {/* ข้อความสำเร็จ (แสดงใต้ Input ก่อนถึงปุ่มกด) */}
          {successMsg && (
            <div className="mt-4 p-3 text-green-600 rounded-lg text-sm text-center font-medium transition-all">
              {successMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-40 py-2 border rounded-md text-sm hover:bg-gray-100 text-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-40 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component ย่อย: PasswordField
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
        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      ></button>
    </div>
  </div>
);
