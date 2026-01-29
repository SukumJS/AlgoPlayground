"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    if (!identifier || !password) {
      setError("Please enter your email/username and password")
      return
    }
    setError("")
    router.push("/")
  }

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Email / Username */}
      <div className="w-[454px] flex flex-col gap-2">
        <label className="text-lg font-semibold text-[#222121] capitalize">
          Email or username
        </label>

        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
            {showPassword ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}
      </div>

      {/* Forgot password */}
      <div className="w-[454px] text-right">
        <button className="text-sm font-medium underline text-black">
          Forgot your password?
        </button>
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        className="
          w-[454px] h-12
          rounded-md
          bg-[#0066CC]
          hover:bg-[#014C97]
          transition-colors
          text-white text-lg font-medium capitalize
        "
      >
        Login
      </button>

      {/* Divider */}
      <div className="w-[465px] flex items-center gap-3">
        <div className="flex-1 h-px bg-[#5D5D5D]" />
        <span className="text-lg font-medium text-[#222121]">or</span>
        <div className="flex-1 h-px bg-[#5D5D5D]" />
      </div>

      {/* Google Button */}
      <button
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
  )
}
