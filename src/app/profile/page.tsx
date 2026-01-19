"use client";

import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import ProgressRow from "../../components/ProgressRow";
import EditProfile from "../../components/EditProfile";
import { useState } from "react";

type ProgressItem = {
  name: string;
  current: number;
  total: number;
};

export default function Profile() {
  // Profile data
  const [profileAvatar, setProfileAvatar] = useState("https://i.pravatar.cc/150");
  const [profileName, setProfileName] = useState("Thunwa");
  const [profileEmail, setProfileEmail] = useState("thunwa@gmail.com");
  const [profileUsername, setProfileUsername] = useState("thunchan");

  // Stats data
  const [totalProgress, setTotalProgress] = useState(73);
  const [pretestScore, setPretestScore] = useState(81);
  const [posttestScore, setPosttestScore] = useState(64);

  // Progress data
  const [progressData, setProgressData] = useState<ProgressItem[]>([
    { name: "Linear Data Structure", current: 2, total: 5 },
    { name: "Trees", current: 2, total: 7 },
    { name: "Graph", current: 2, total: 6 },
    { name: "Sorting", current: 2, total: 5 },
    { name: "Searching", current: 0, total: 2 },
  ]);

  const [openEdit, setOpenEdit] = useState(false);

  const handleProfileUpdate = (updatedData: {
    username?: string;
    avatar?: string;
    name?: string;
  }) => {
    if (updatedData.username) setProfileUsername(updatedData.username);
    if (updatedData.avatar) setProfileAvatar(updatedData.avatar);
    if (updatedData.name) setProfileName(updatedData.name);
    //เรียก API เพื่ออัพเดทข้อมูลใน backend
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <Navbar />

      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* PROFILE */}
        <div className="col-span-3 rounded-xl p-6 text-center">
          <img
            src={profileAvatar}
            alt={profileName}
            className="w-28 h-28 rounded-full mx-auto mb-4"
          />

          <h2 className="text-xl font-semibold text-black">{profileName}</h2>

          <div className="flex justify-center items-center gap-2 text-black text-sm mt-1">
            <span>✉</span>
            <span>{profileEmail}</span>
          </div>

          {/* ปุ่ม Edit Profile */}
          <button
            onClick={() => setOpenEdit(true)}
            className="mt-4 px-5 py-1.5 border rounded-full text-sm hover:bg-gray-100 text-black"
          >
            Edit Profile
          </button>
        </div>

        {/* RIGHT */}
        <div className="col-span-9 space-y-6">
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

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-4 text-black">Algorithm Categories</h3>

            {progressData.map((item) => (
              <ProgressRow key={item.name} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {openEdit && (
        <EditProfile
          onClose={() => setOpenEdit(false)}
          username={profileUsername}
          email={profileEmail}
          avatar={profileAvatar}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
