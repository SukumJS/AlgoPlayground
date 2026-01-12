"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")


    // state data 
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    //mock register
    const handleRegister = () => {
        if (!email || !username || !password) {
            setError("Please fill in all fields")
            return
        }
        setError("")
        console.log("REGISTER DATA:", { email, username, password })

        // redirect to login page
        router.push("/auth/login")
    }

    return (
        <div className="flex flex-col items-center gap-[25px]">

            <div className="w-full text-[20px] font-semibold text-[#222121]">
                Email
            </div>
            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-[454px] h-[50px] border border-[#222121] text-[#222121] rounded-[5px] px-4"
            />

            <div className="w-full text-[20px] font-semibold text-[#222121]">
                Username
            </div>
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-[454px] h-[50px] border border-[#222121] text-[#222121] rounded-[5px] px-4"
            />

            <div className="w-full text-[20px] font-semibold text-[#222121] capitalize">
                Password
            </div>

            <div className="relative w-[454px]">
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[50px] border border-[#222121] rounded-[5px] text-[#222121] px-4 pr-12"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                        absolute right-4 top-1/2 -translate-y-1/2
                        text-[#222121]
                        hover:text-black
                        cursor-pointer
                    "
                >
                    {showPassword ? (
                        /* eye-open */
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    ) : (
                        /* eye-off */
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    )}
                </button>
                {error && (
                    <div className="w-[454px] text-red-500 text-[14px]">
                        {error}
                    </div>
                )}

            </div>

            <button
                onClick={handleRegister}
                className="
                    w-[454px] h-[50px]
                    bg-[#0066CC]
                    hover:bg-[#014C97]
                    transition-colors duration-200
                    text-white
                    text-[20px]
                    font-medium
                    capitalize
                    rounded-[5px]
                "
            >
                Create Account
            </button>

            <div className="text-[16px] font-bold capitalize">
                <span className="text-[#222121]">already have an account?</span>
                <a href="/auth/login" className="text-[#0066CC] ml-1">
                    Login
                </a>
            </div>
        </div>
    )
}
