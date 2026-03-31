"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/src/config/firebase";
import { authService } from "@/src/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await userCred.user.getIdToken();
      localStorage.setItem("access_token", idToken);
      // sync is best-effort — don't block signup if backend is down
      try {
        await authService.sync();
      } catch (err) {
        await userCred.user.delete();

        localStorage.removeItem("access_token");

        setError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/");
    } catch (err) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code) {
        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            setError("Email is already in use.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format.");
            break;
          case "auth/weak-password":
            setError("Password must be at least 6 characters long.");
            break;
          default:
            setError("An error occurred during sign up. Please try again.");
            break;
        }
      } else if (err instanceof Error) {
        setError(
          err.message || "An error occurred during sign up. Please try again.",
        );
      } else {
        setError("An error occurred during sign up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const idToken = await userCred.user.getIdToken();
      localStorage.setItem("access_token", idToken);
      try {
        await authService.sync();
      } catch (err) {
        await userCred.user.delete();

        localStorage.removeItem("access_token");

        setError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/");
    } catch (err) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code) {
        switch (firebaseError.code) {
          case "auth/popup-closed-by-user":
            setError("You closed the sign-in window.");
            break;
          case "auth/popup-blocked":
            setError("Sign-in window was blocked by the browser.");
            break;
          default:
            setError("An error occurred during Google sign-in.");
            break;
        }
      } else if (err instanceof Error) {
        setError(err.message || "An error occurred during Google sign-in.");
      } else {
        setError("An error occurred during Google sign-in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Email */}
      <div className="w-[454px] flex flex-col gap-2">
        <label className="text-lg font-semibold text-[#222121]">Email</label>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            h-12
            border border-[#222121]
            rounded-md
            px-4
            text-base text-[#222121]
          "
        />
      </div>

      {/* Password */}
      <div className="w-[454px] flex flex-col gap-2">
        <label className="text-lg font-semibold text-[#222121]">Password</label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full h-12
              border border-[#222121]
              rounded-md
              px-4 pr-12
              text-base text-[#222121]
            "
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              text-[#222121] hover:text-black
            "
          >
            {showPassword ? (
              <Eye className="w-6 h-6" />
            ) : (
              <EyeOff className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="w-[454px] flex flex-col gap-2">
        <label className="text-lg font-semibold text-[#222121]">
          Confirm Password
        </label>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="
              w-full h-12
              border border-[#222121]
              rounded-md
              px-4 pr-12
              text-base text-[#222121]
            "
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              text-[#222121] hover:text-black
            "
          >
            {showConfirmPassword ? (
              <Eye className="w-6 h-6" />
            ) : (
              <EyeOff className="w-6 h-6" />
            )}
          </button>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={loading}
        className="
          w-[454px] h-12
          rounded-md
          bg-[#0066CC] hover:bg-[#014C97]
          disabled:bg-gray-400
          transition-colors
          text-white text-lg font-medium capitalize
        "
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      {/* Divider */}
      <div className="w-[465px] flex items-center gap-3">
        <div className="flex-1 h-px bg-[#5D5D5D]" />
        <span className="text-lg font-medium text-[#222121]">or</span>
        <div className="flex-1 h-px bg-[#5D5D5D]" />
      </div>

      {/* Google Button */}
      <button
        onClick={handleGoogleSignup}
        className="
          w-[454px]
          rounded-md border border-[#222121]
          py-3
          flex items-center justify-center gap-2
          text-lg font-medium text-[#222121]
          bg-white hover:bg-[#D9D9D9]
          transition-colors
        "
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png"
          alt="Google"
          className="w-6 h-6"
        />
        Continue with Google
      </button>

      {/* Footer */}
      <div className="text-base font-bold capitalize">
        <span className="text-[#222121]">already have an account?</span>
        <a href="/auth/signin" className="ml-1 text-[#0066CC]">
          Sign in
        </a>
      </div>
    </div>
  );
}
