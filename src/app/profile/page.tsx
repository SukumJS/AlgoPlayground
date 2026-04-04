"use client";

import Navbar from "../../components/Navbar";
import StatCard from "../../components/profile/StatCard";
import ProgressRow from "../../components/profile/ProgressRow";
import ChangePassword from "../../components/ChangePassword";
import { useRef, useState } from "react";
import { PencilLine } from "lucide-react";
import { useAuth } from "@/src/components/shared/AuthProvider";
import { updateProfileImage } from "@/src/lib/auth.service";

type ProgressItem = {
  name: string;
  current: number;
  total: number;
};

export default function Profile() {
  const CROP_VIEW_SIZE = 280;
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const { token, user, updateUser } = useAuth();
  const profileAvatar = user?.imageUrl || "https://i.pravatar.cc/150";
  const profileName = user?.uid || user?.email?.split("@")[0] || "Thunwa";
  const profileEmail = user?.email || "thunwa@gmail.com";
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);

  const [totalProgress, setTotalProgress] = useState(73);
  const [pretestScore, setPretestScore] = useState(81);
  const [posttestScore, setPosttestScore] = useState(64);

  const [progressData, setProgressData] = useState<ProgressItem[]>([
    { name: "Linear Data Structure", current: 2, total: 5 },
    { name: "Trees", current: 2, total: 7 },
    { name: "Graph", current: 2, total: 6 },
    { name: "Sorting", current: 2, total: 5 },
    { name: "Searching", current: 0, total: 2 },
  ]);

  // MODAL STATES
  const [openPassword, setOpenPassword] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleAvatarPick = () => {
    avatarInputRef.current?.click();
  };

  const closeCropModal = () => {
    if (cropSource) {
      URL.revokeObjectURL(cropSource);
    }
    setCropSource(null);
    setIsCropOpen(false);
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
  };

  const cropImageToFile = async (
    sourceUrl: string,
    zoom: number,
    offsetX: number,
    offsetY: number,
  ): Promise<File> => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = sourceUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image for crop"));
    });

    const outputSize = 512;
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not supported in this browser");
    }

    const baseScale = Math.max(
      CROP_VIEW_SIZE / image.naturalWidth,
      CROP_VIEW_SIZE / image.naturalHeight,
    );
    const finalScale = baseScale * zoom;

    const drawWidth = image.naturalWidth * finalScale;
    const drawHeight = image.naturalHeight * finalScale;

    const drawX = (CROP_VIEW_SIZE - drawWidth) / 2 + offsetX;
    const drawY = (CROP_VIEW_SIZE - drawHeight) / 2 + offsetY;

    const ratio = outputSize / CROP_VIEW_SIZE;
    ctx.drawImage(
      image,
      drawX * ratio,
      drawY * ratio,
      drawWidth * ratio,
      drawHeight * ratio,
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    if (!blob) {
      throw new Error("Failed to generate cropped image");
    }

    return new File([blob], "profile.jpg", { type: "image/jpeg" });
  };

  const handleConfirmCrop = async () => {
    if (!cropSource) return;

    if (!token) {
      setAvatarError("You must be signed in to update your profile picture.");
      closeCropModal();
      return;
    }

    let localImageUrl: string | null = null;

    try {
      setIsUploadingAvatar(true);
      setAvatarError("");

      const croppedFile = await cropImageToFile(
        cropSource,
        cropZoom,
        cropX,
        cropY,
      );

      localImageUrl = URL.createObjectURL(croppedFile);
      const previousImageUrl = user?.imageUrl;

      setAvatarPreview(localImageUrl);
      updateUser({
        ...(user ?? {}),
        imageUrl: localImageUrl,
      });

      const imageUrl = await updateProfileImage(croppedFile, token);
      updateUser({
        ...(user ?? {}),
        imageUrl,
      });
      setAvatarPreview(null);
      closeCropModal();

      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
      }
    } catch (error) {
      setAvatarError(
        error instanceof Error
          ? error.message
          : "Failed to upload profile image",
      );
      setAvatarPreview(null);
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
      }
      updateUser({
        ...(user ?? {}),
        imageUrl: user?.imageUrl,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const localImageUrl = URL.createObjectURL(file);
    setAvatarError("");
    setCropSource(localImageUrl);
    setIsCropOpen(true);

    // Reset input value so selecting the same file again still triggers onChange
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      <Navbar onSelectCategory={setSelectedCategory} />

      <div className="mt-6 grid grid-cols-12 mt-18 px-20">
        {/* LEFT: PROFILE */}
        <div className="col-span-3 rounded-xl p-6 text-center">
          <div>
            <img
              src={avatarPreview || profileAvatar}
              alt="profile"
              className="w-28 h-28 rounded-full mx-auto mb-4 border object-cover"
            />
            <div
              onClick={handleAvatarPick}
              className="border border-black rounded-full w-auto h-auto p-2 absolute -mt-12 ml-52 bg-white cursor-pointer"
            >
              <PencilLine size={16} />
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
          </div>
          {avatarError && (
            <p className="mt-3 text-sm text-red-500">{avatarError}</p>
          )}
          {isUploadingAvatar && (
            <p className="mt-3 text-sm text-gray-500">Uploading image...</p>
          )}
          <h2 className="text-xl font-semibold">{profileName}</h2>
          <div className="flex justify-center items-center gap-2 text-sm mt-1 text-gray-600">
            <span>✉</span>
            <span>{profileEmail}</span>
          </div>

          <div className="flex flex-col items-center gap-3 mt-6">
            <button
              onClick={() => setOpenPassword(true)}
              className="w-full max-w-40 py-1.5 border rounded-full text-sm hover:bg-gray-100 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* RIGHT: STATS & PROGRESS */}
        <div className="col-span-9 space-y-6 mr-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              title="Total Progress"
              value={`${totalProgress}%`}
              desc="Overall completion rate"
            />
            <StatCard
              title="Pretest Score"
              value={`${pretestScore}%`}
              desc="Average across all tests"
            />
            <StatCard
              title="Posttest Score"
              value={`${posttestScore}%`}
              desc="+30% improvement"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Algorithm Categories</h3>
            {progressData.map((item) => (
              <ProgressRow key={item.name} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* 3. เพิ่ม Modal ChangePassword */}
      {openPassword && (
        <ChangePassword onClose={() => setOpenPassword(false)} />
      )}

      {isCropOpen && cropSource && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[420px] rounded-xl bg-white p-5 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-[#222121]">
              Crop profile image
            </h3>

            <div className="mx-auto mb-4 flex h-[280px] w-[280px] items-center justify-center overflow-hidden rounded-full border border-[#D0D0D0] bg-[#F4F4F4]">
              <img
                src={cropSource}
                alt="Crop preview"
                className="select-none"
                draggable={false}
                style={{
                  transform: `translate(${cropX}px, ${cropY}px) scale(${cropZoom})`,
                  transformOrigin: "center center",
                  width: CROP_VIEW_SIZE,
                  height: CROP_VIEW_SIZE,
                  objectFit: "cover",
                }}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#222121]">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                className="w-full"
              />

              <label className="block text-sm font-medium text-[#222121]">
                Horizontal Position
              </label>
              <input
                type="range"
                min={-140}
                max={140}
                step={1}
                value={cropX}
                onChange={(e) => setCropX(Number(e.target.value))}
                className="w-full"
              />

              <label className="block text-sm font-medium text-[#222121]">
                Vertical Position
              </label>
              <input
                type="range"
                min={-140}
                max={140}
                step={1}
                value={cropY}
                onChange={(e) => setCropY(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCropModal}
                className="rounded-md border border-[#CFCFCF] px-4 py-2 text-sm text-[#222121]"
                disabled={isUploadingAvatar}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleConfirmCrop();
                }}
                className="rounded-md bg-[#0066CC] px-4 py-2 text-sm text-white"
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
