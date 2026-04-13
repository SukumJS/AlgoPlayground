"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import AlgorithmSection from "../components/AlgorithmSection";
import {
  algorithmCatalog,
  AlgorithmSectionData,
} from "../data/algorithmCatalog";
import { progressService, AllProgressData } from "../services/progress.service";

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [progressData, setProgressData] = useState<AllProgressData | null>(
    null,
  );

  // Fetch real progress from backend
  useEffect(() => {
    let cancelled = false;

    const fetchProgress = async () => {
      try {
        const response = await progressService.getAllProgress();
        if (!cancelled) {
          setProgressData(response.data.data);
        }
      } catch {
        // Silent fail — show default "locked" state
      }
    };

    fetchProgress();
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge real progress into catalog
  const catalogWithProgress: AlgorithmSectionData[] = useMemo(() => {
    if (!progressData) return algorithmCatalog;

    return algorithmCatalog.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        const realProgress = progressData[item.slug];
        if (!realProgress) return item;

        return {
          ...item,
          progress: {
            pretest: {
              status: realProgress.pretest.status,
              score: realProgress.pretest.score,
              answeredCount: realProgress.pretest.answeredCount,
              totalCount: realProgress.pretest.totalCount || 5,
            },
            posttest: {
              status: realProgress.posttest.status,
              score: realProgress.posttest.score,
              answeredCount: realProgress.posttest.answeredCount,
              totalCount: realProgress.posttest.totalCount || 5,
            },
          },
        };
      }),
    }));
  }, [progressData]);

  return (
    <div className="bg-white min-h-screen w-full absolute top-0 left-0 ">
      <Navbar onSelectCategory={setSelectedCategory} />

      <main className="pt-[96px]">
        <div className="mx-auto max-w-[1440px] px-[30px]">
          {(selectedCategory === "all"
            ? catalogWithProgress
            : catalogWithProgress.filter(
                (section) => section.id === selectedCategory,
              )
          ).map((section) => (
            <AlgorithmSection
              key={section.id}
              sectionId={section.id}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
