"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/src/config/firebase";
import { syncUserWithBackend } from "@/src/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // เพิ่มการตรวจสอบ emailVerified
      if (!userCred.user.emailVerified) {
        setError("Please verify your email address. Check your inbox.");
        // await auth.signOut();
        setLoading(false);
        return;
      }

      //  บังคับดึง Token ใหม่เสมอ (ใส่ true)
      // เพื่อให้แน่ใจว่าได้ Token ที่มีค่า "email_verified": true อัปเดตล่าสุด
      const idToken = await userCred.user.getIdToken(true);

      localStorage.setItem("access_token", idToken);
      try {
        await syncUserWithBackend(idToken);
      } catch (err) {
        console.error("SYNC ERROR:", err);
        setError("Server error. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/");
    } catch (err) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code) {
        switch (firebaseError.code) {
          case "auth/invalid-credential":
          case "auth/invalid-login-credentials":
          case "auth/user-not-found":
          case "auth/wrong-password":
            setError("Invalid email or password.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format.");
            break;
          case "auth/user-disabled":
            setError("This account has been disabled.");
            break;
          case "auth/too-many-requests":
            setError("Too many sign-in attempts. Please try again later.");
            break;
          default:
            setError("An error occurred during sign in. Please try again.");
            break;
        }
      } else if (err instanceof Error) {
        setError(
          err.message || "An error occurred during sign in. Please try again.",
        );
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const idToken = await userCred.user.getIdToken();
      localStorage.setItem("access_token", idToken);
      // sync is best-effort — don't block login if backend is down
      try {
        await syncUserWithBackend(idToken);
      } catch (err) {
        console.error("SYNC ERROR:", err);

        setError("Server error. Please try again.");
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
    <div className="flex flex-col items-center gap-6">
      {/* Email */}
      <div className="w-[454px] flex flex-col gap-2">
        <label className="text-lg font-semibold text-[#222121] capitalize">
          Email
        </label>

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
        <label className="text-lg font-semibold text-[#222121] capitalize">
          Password
        </label>

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

        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>

      {/* Forgot password */}
      <div className="w-[454px] text-right">
        <button
          type="button" // ใส่ type="button" กันฟอร์ม submit อัตโนมัติ
          onClick={() => router.push("/auth/forgot-password")}
          className="text-sm font-medium underline text-black hover:text-[#0066CC] transition-colors"
        >
          Forgot your password?
        </button>
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="
          w-[454px] h-12
          rounded-md
          bg-[#0066CC]
          hover:bg-[#014C97]
          disabled:bg-gray-400
          transition-colors
          text-white text-lg font-medium capitalize
        "
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Divider */}
      <div className="w-[465px] flex items-center gap-3">
        <div className="flex-1 h-px bg-[#5D5D5D]" />
        <span className="text-lg font-medium text-[#222121]">or</span>
        <div className="flex-1 h-px bg-[#5D5D5D]" />
      </div>

      {/* Google Button */}
      <button
        onClick={handleGoogleLogin}
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
        <span className="text-[#222121]">don’t have an account?</span>
        <a href="/auth/signup" className="ml-1 text-[#0066CC]">
          Sign up
        </a>
      </div>
    </div>
  );
}
