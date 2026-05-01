"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/src/config/firebase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      // สั่ง Firebase ส่งอีเมลรีเซ็ตรหัสผ่าน
      await sendPasswordResetEmail(auth, email);

      setMessage("Password reset email sent! Please check your inbox.");
      // ล้างช่องกรอกอีเมล
      setEmail("");
    } catch (err) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h2 className="text-2xl font-bold text-[#222121]">Reset Password</h2>
      <p className="text-[#5D5D5D] text-center w-[454px]">
        Enter the email address associated with your account and we will send
        you a link to reset your password.
      </p>

      {/* ช่องกรอก Email */}
      <div className="w-[454px] flex flex-col gap-2 mt-4">
        <label className="text-lg font-semibold text-[#222121]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            h-12 border border-[#222121] rounded-md px-4
            text-base text-[#222121]
          "
          placeholder="Enter your email"
        />
        {error && <div className="text-sm text-red-500">{error}</div>}
        {message && (
          <div className="text-sm text-green-600 font-medium">{message}</div>
        )}
      </div>

      {/* ปุ่มส่ง Email */}
      <button
        onClick={handleResetPassword}
        disabled={loading}
        className="
          w-[454px] h-12 mt-2 rounded-md
          bg-[#0066CC] hover:bg-[#014C97]
          disabled:bg-gray-400 transition-colors
          text-white text-lg font-medium
        "
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      {/* ปุ่มกลับไปหน้า Login */}
      <button
        onClick={() => router.push("/auth/signin")}
        className="mt-4 text-[#0066CC] hover:underline font-medium"
      >
        Back to Sign In
      </button>
    </div>
  );
}
