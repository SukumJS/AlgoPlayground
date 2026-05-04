"use client";

import Navbar from "../../components/Navbar";
import StatCard from "../../components/profile/StatCard";
import ProgressRow from "../../components/profile/ProgressRow";
import ChangePassword from "../../components/ChangePassword";
import { useEffect, useRef, useState } from "react";
import { PencilLine } from "lucide-react";
import {
  syncUserWithBackend,
  updateProfileImage,
} from "@/src/services/auth.service";
import { useAuth } from "@/src/hooks/useAuth";
import { saveAuthSession } from "@/src/lib/auth-storage";

type ProgressItem = {
  name: string;
  current: number;
  total: number;
};

export default function Profile() {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const { token, user } = useAuth();
  const [localUser, setLocalUser] = useState(user);
  const isGoogleUser = user?.authProvider === "google.com";
  const profileAvatar = localUser?.imageUrl ?? "";
  const profileName =
    localUser?.uid || localUser?.email?.split("@")[0] || "Unknown";
  const profileEmail = localUser?.email || "Unknown";
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropRenderWidth, setCropRenderWidth] = useState(0);
  const [cropRenderHeight, setCropRenderHeight] = useState(0);
  const [cropCircleX, setCropCircleX] = useState(0);
  const [cropCircleY, setCropCircleY] = useState(0);
  const [cropCircleRadius, setCropCircleRadius] = useState(80);
  const [isDraggingCircle, setIsDraggingCircle] = useState(false);

  // MODAL STATES
  const [openPassword, setOpenPassword] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const refreshProfile = async () => {
      try {
        const syncedUser = await syncUserWithBackend(token);
        if (cancelled) return;

        setLocalUser({
          id: syncedUser?.id,
          uid: syncedUser?.uid,
          email: syncedUser?.email,
          imageUrl: syncedUser?.imageUrl,
          updatedAt: syncedUser?.updatedAt,
          progress: syncedUser?.progress,
          categoryAlgoProgress: syncedUser?.categoryAlgoProgress,
        });
      } catch {
        // Keep cached profile data when sync fails.
      }
    };

    void refreshProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const profileUser = localUser ?? user;
  const totalProgress = profileUser?.progress?.totalProgress ?? 0;
  const pretestScore = profileUser?.progress?.pretestScore ?? 0;
  const posttestScore = profileUser?.progress?.posttestScore ?? 0;
  const progressData = [
    {
      name: "Linear Data Structure",
      current: profileUser?.categoryAlgoProgress?.linear ?? 0,
      total: 5,
    },
    {
      name: "Trees",
      current: profileUser?.categoryAlgoProgress?.trees ?? 0,
      total: 7,
    },
    {
      name: "Graph",
      current: profileUser?.categoryAlgoProgress?.graph ?? 0,
      total: 6,
    },
    {
      name: "Sorting",
      current: profileUser?.categoryAlgoProgress?.sorting ?? 0,
      total: 5,
    },
    {
      name: "Searching",
      current: profileUser?.categoryAlgoProgress?.searching ?? 0,
      total: 2,
    },
  ];

  const handleAvatarPick = () => {
    avatarInputRef.current?.click();
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const getMaxCropRadius = (width: number, height: number) =>
    Math.max(24, Math.floor(Math.min(width, height) / 2));

  const closeCropModal = () => {
    if (cropSource) {
      URL.revokeObjectURL(cropSource);
    }
    setCropSource(null);
    setIsCropOpen(false);
    setCropRenderWidth(0);
    setCropRenderHeight(0);
    setCropCircleX(0);
    setCropCircleY(0);
    setCropCircleRadius(80);
    setIsDraggingCircle(false);
  };

  const cropImageToFile = async (
    sourceUrl: string,
    renderWidth: number,
    renderHeight: number,
    circleX: number,
    circleY: number,
    circleRadius: number,
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

    if (!renderWidth || !renderHeight) {
      throw new Error("Image is not ready for cropping");
    }

    const scaleX = image.naturalWidth / renderWidth;
    const scaleY = image.naturalHeight / renderHeight;

    const sourceX = (circleX - circleRadius) * scaleX;
    const sourceY = (circleY - circleRadius) * scaleY;
    const sourceWidth = circleRadius * 2 * scaleX;
    const sourceHeight = circleRadius * 2 * scaleY;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize,
      outputSize,
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
        cropRenderWidth,
        cropRenderHeight,
        cropCircleX,
        cropCircleY,
        cropCircleRadius,
      );

      localImageUrl = URL.createObjectURL(croppedFile);

      setAvatarPreview(localImageUrl);

      const imageUrl = await updateProfileImage(
        croppedFile,
        token,
        localUser?.uid,
      );
      try {
        const syncedUser = await syncUserWithBackend(token);
        const updatedUser = {
          id: syncedUser?.id,
          uid: syncedUser?.uid,
          email: syncedUser?.email,
          imageUrl: syncedUser?.imageUrl || imageUrl,
          updatedAt: syncedUser?.updatedAt,
          progress: syncedUser?.progress,
          categoryAlgoProgress: syncedUser?.categoryAlgoProgress,
        };
        setLocalUser(updatedUser);
        // Save updated profile to localStorage
        if (token) {
          saveAuthSession(token, updatedUser);
          // Trigger storage event for Navbar to listen
          window.dispatchEvent(new Event("authProfileUpdated"));
        }
      } catch {
        const updatedUser = {
          ...(localUser ?? {}),
          imageUrl,
        };
        setLocalUser(updatedUser);
        // Save to localStorage
        if (token) {
          saveAuthSession(token, updatedUser);
        }
      }
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
    setCropRenderWidth(0);
    setCropRenderHeight(0);
    setCropCircleX(0);
    setCropCircleY(0);
    setCropCircleRadius(80);
    setIsDraggingCircle(false);

    // Reset input value so selecting the same file again still triggers onChange
    event.target.value = "";
  };

  const handleCropImageLoad = () => {
    const imageElement = cropImageRef.current;
    if (!imageElement) return;

    const width = imageElement.clientWidth;
    const height = imageElement.clientHeight;
    if (!width || !height) return;

    const initialRadius = Math.max(40, Math.min(width, height) * 0.2);
    const maxRadius = getMaxCropRadius(width, height);
    setCropRenderWidth(width);
    setCropRenderHeight(height);
    setCropCircleX(width / 2);
    setCropCircleY(height / 2);
    setCropCircleRadius(clamp(initialRadius, 24, maxRadius));
  };

  const updateCirclePosition = (clientX: number, clientY: number) => {
    const imageElement = cropImageRef.current;
    if (!imageElement) return;

    const rect = imageElement.getBoundingClientRect();
    const relativeX = clamp(clientX - rect.left, 0, cropRenderWidth);
    const relativeY = clamp(clientY - rect.top, 0, cropRenderHeight);

    const boundedX = clamp(
      relativeX,
      cropCircleRadius,
      cropRenderWidth - cropCircleRadius,
    );
    const boundedY = clamp(
      relativeY,
      cropCircleRadius,
      cropRenderHeight - cropCircleRadius,
    );

    setCropCircleX(boundedX);
    setCropCircleY(boundedY);
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropRenderWidth || !cropRenderHeight) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingCircle(true);
    updateCirclePosition(event.clientX, event.clientY);
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCircle) return;
    updateCirclePosition(event.clientX, event.clientY);
  };

  const handleCropPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDraggingCircle(false);
  };

  return (
    <div className="min-h-screen p-6 text-black bg-white">
      <Navbar onSelectCategory={setSelectedCategory} />

      <div className="mt-18 px-4 md:px-12 lg:px-20 flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-0">
        {/* LEFT: PROFILE */}
        <div className="col-span-3 p-6 text-center rounded-xl">
          <div className="relative mx-auto mb-4 h-30 w-30">
            {avatarPreview || profileAvatar ? (
              <img
                src={avatarPreview || profileAvatar}
                alt="profile"
                className="object-cover border rounded-full h-30 w-30"
              />
            ) : (
              <div className="h-30 w-30 rounded-full border bg-gray-100" />
            )}
            <button
              type="button"
              onClick={handleAvatarPick}
              className="absolute p-2 transition-colors bg-white border border-black rounded-full cursor-pointer bottom-2 right-2 translate-x-1/4 translate-y-1/4 hover:bg-gray-200"
              aria-label="Change profile image"
            >
              <PencilLine size={16} />
            </button>
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
          <div className="flex items-center justify-center gap-2 mt-1 text-sm text-gray-600">
            <span>✉</span>
            <span>{profileEmail}</span>
          </div>

          {!isGoogleUser && (
            <div className="flex flex-col items-center gap-3 mt-6">
              <button
                onClick={() => setOpenPassword(true)}
                className="w-full max-w-40 py-1.5 border rounded-full text-sm hover:bg-gray-100 transition-colors"
              >
                Change Password
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: STATS & PROGRESS */}
        <div className="col-span-9 mr-4 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="Total Progress" value={`${totalProgress}%`} />
            <StatCard title="Pretest Score" value={`${pretestScore}%`} />
            <StatCard title="Posttest Score" value={`${posttestScore}%`} />
          </div>

          <div className="p-6 bg-white border shadow-sm rounded-xl">
            <h3 className="mb-4 font-semibold">Algorithm Categories</h3>
            {progressData.map((item) => (
              <ProgressRow key={item.name} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* 3. เพิ่ม Modal ChangePassword */}
      {!isGoogleUser && openPassword && (
        <ChangePassword onClose={() => setOpenPassword(false)} />
      )}

      {isCropOpen && cropSource && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[640px] rounded-xl bg-white p-5 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-[#222121]">
              Crop profile image
            </h3>

            <p className="mb-3 text-sm text-[#5D5D5D]">
              Drag the circle to choose the desired area, then adjust its size
              before clicking Save.
            </p>

            <div
              className="relative mx-auto mb-4 max-h-[420px] w-full select-none touch-none overflow-hidden rounded-xl border border-[#D0D0D0] bg-[#F4F4F4]"
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerLeave={handleCropPointerUp}
            >
              <img
                ref={cropImageRef}
                src={cropSource}
                alt="Crop preview"
                className="mx-auto max-h-[420px] w-full object-contain"
                draggable={false}
                onLoad={handleCropImageLoad}
              />

              {cropRenderWidth > 0 && cropRenderHeight > 0 && (
                <div
                  className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
                  style={{
                    left: cropCircleX - cropCircleRadius,
                    top: cropCircleY - cropCircleRadius,
                    width: cropCircleRadius * 2,
                    height: cropCircleRadius * 2,
                    borderRadius: "9999px",
                  }}
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#222121]">
                Circle Size
              </label>
              <input
                type="range"
                min={24}
                max={getMaxCropRadius(
                  cropRenderWidth || 1,
                  cropRenderHeight || 1,
                )}
                step={1}
                value={cropCircleRadius}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  const maxRadius = getMaxCropRadius(
                    cropRenderWidth || 1,
                    cropRenderHeight || 1,
                  );
                  const nextRadius = clamp(next, 24, maxRadius);
                  setCropCircleRadius(nextRadius);
                  setCropCircleX((prev) =>
                    clamp(
                      prev,
                      nextRadius,
                      Math.max(nextRadius, cropRenderWidth - nextRadius),
                    ),
                  );
                  setCropCircleY((prev) =>
                    clamp(
                      prev,
                      nextRadius,
                      Math.max(nextRadius, cropRenderHeight - nextRadius),
                    ),
                  );
                }}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-2 mt-5">
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
