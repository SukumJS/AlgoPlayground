export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center">
      <div
        className="
          bg-white
          rounded-[30px]
          px-[50px] py-[50px]
          shadow-[0px_0px_10px_2px_rgba(0,0,0,0.25)]
          outline outline-1 outline-[#D9D9D9] outline-offset-[-1px]
          flex flex-col items-center gap-[70px]
        "
      >
        {/* Title */}
        <h1
          className="
            text-[40px]
            font-semibold
            uppercase
            text-[#222121]
            text-center
            drop-shadow-[0px_0px_6px_rgba(0,0,0,0.25)]
          "
        >
          Algo playground
        </h1>

        {children}
      </div>
    </main>
  )
}
