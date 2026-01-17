import { ProgressRow } from "./ProgressRow"

interface Props {
  title: string
  progress: {
    pretest: {
      percent: number
      status: "locked" | "active" | "completed"
    }
    posttest: {
      percent: number
      status: "locked" | "active" | "completed"
    }
  }
}

export default function AlgorithmCard({ title, progress }: Props) {
  return (
    <div
      className="
        relative w-[242px] h-[352px]
        rounded-[25px]
        shadow-[0px_8px_20px_rgba(0,0,0,0.18)]
        bg-transparent
      "
    >
      {/* Header */}
      <div
        className="
          absolute top-0 left-0 w-full h-[170px]
          bg-gradient-to-b from-[#00478F] via-[#005CB8] to-[#4D94DB]
          rounded-t-[25px]
        "
      />

      {/* Icons */}
      <div className="absolute top-[85px] left-[53px] w-[31px] h-[27px] bg-white" />
      <div className="absolute top-[85px] left-[106px] w-[31px] h-[28px] bg-white" />
      <div className="absolute top-[85px] left-[159px] w-[31px] h-[28px] bg-white" />

      {/* Body */}
      <div
        className="
          absolute top-[170px] left-0 w-full h-[182px]
          bg-white
          rounded-b-[25px]
          flex flex-col items-center justify-center
          p-[15px] gap-[10px]
        "
      >
        <h3 className="text-[20px] font-semibold text-[#222121] text-center leading-none">
          {title}
        </h3>

        <ProgressRow
          label="Pretest"
          percent={progress.pretest.percent}
          status={progress.pretest.status}
        />

        <ProgressRow
          label="Post-test"
          percent={progress.posttest.percent}
          status={progress.posttest.status}
        />
      </div>

      {/* Top right icon */}
      <img
        src="https://placehold.co/24x24"
        className="absolute top-[15px] right-[15px] w-[24px] h-[24px]"
        alt=""
      />
    </div>
  )
}
