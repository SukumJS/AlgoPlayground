"use client";

import React from "react";
import TrackProgress from "@/src/components/pretest/TrackProgress";
import ChoiceCard from "@/src/components/pretest/ChoiceCard";
import { OrderingResultDisplay } from "./OrderingQuestion";
import { PlaygroundOrderingResult } from "./PlaygroundOrderingQuestion";
import {
    PosttestData,
    PosttestQuestion,
    PosttestUserAnswer,
} from "@/src/app/types/posttest";

type PosttestResultPageProps = {
    posttest: PosttestData;
    selectedQuestions: PosttestQuestion[];
    userAnswers: PosttestUserAnswer[];
    onGoHome: () => void;
    algoType: string;
    className?: string;
};

function PosttestResultPage({
    posttest,
    selectedQuestions,
    userAnswers,
    onGoHome,
    algoType,
    className = "",
}: PosttestResultPageProps) {
    const nodeVariant = algoType === "sorting" ? "square" : "circle";

    // Calculate score per question
    const getQuestionScore = (question: PosttestQuestion): number => {
        const answer = userAnswers.find((a) => a.questionId === question.id);
        if (!answer) return 0;

        switch (question.type) {
            case "multiple_choice":
                return answer.selectedChoiceId ===
                    question.question.multipleChoice.correctChoiceId
                    ? 1
                    : 0;
            case "fill_blank":
                return (answer.filledAnswer || "").trim().toLowerCase() ===
                    question.question.correctAnswer.trim().toLowerCase()
                    ? 1
                    : 0;
            case "ordering": {
                const userOrder = answer.orderedItems || [];
                const correctOrder = question.question.correctOrder;
                if (userOrder.length !== correctOrder.length) return 0;
                return userOrder.every((id, i) => id === correctOrder[i]) ? 1 : 0;
            }
            default:
                return 0;
        }
    };

    const totalScore = selectedQuestions.reduce(
        (acc, q) => acc + getQuestionScore(q),
        0
    );
    const totalQuestions = selectedQuestions.length;

    // Render answer display per question type
    const renderAnswerDisplay = (
        question: PosttestQuestion,
        answer: PosttestUserAnswer
    ) => {
        switch (question.type) {
            case "multiple_choice": {
                const isCorrect =
                    answer.selectedChoiceId ===
                    question.question.multipleChoice.correctChoiceId;
                const correctId = question.question.multipleChoice.correctChoiceId;

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.question.multipleChoice.choices.map((choice) => {
                            const isUserSelected = answer.selectedChoiceId === choice.id;
                            const isCorrectChoice = choice.id === correctId;

                            // If user got it wrong, highlight correct answer green
                            let extraClass = "";
                            if (!isCorrect && isCorrectChoice) {
                                extraClass = "!bg-green-100 !border-green-400";
                            }

                            return (
                                <ChoiceCard
                                    key={choice.id}
                                    id={choice.id}
                                    text={choice.text}
                                    isSelected={isUserSelected}
                                    disabled={true}
                                    onSelect={() => { }}
                                    className={extraClass}
                                />
                            );
                        })}
                    </div>
                );
            }

            case "fill_blank":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">
                                Your answer:
                            </span>
                            <span className="px-4 py-2 bg-gray-100 rounded-lg text-[#222121] font-medium">
                                {answer.filledAnswer || "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">
                                Correct answer:
                            </span>
                            <span className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
                                {question.question.correctAnswer}
                            </span>
                        </div>
                    </div>
                );

            case "ordering": {
                const userOrder = answer.orderedItems || [];
                const canvasData = question.question.canvasData;

                // Canvas-type ordering (tree/graph) — show badge rows
                if (canvasData) {
                    return (
                        <div className="space-y-3">
                            <PlaygroundOrderingResult
                                canvasData={canvasData}
                                items={question.question.items}
                                orderedIds={userOrder}
                                correctOrder={question.question.correctOrder}
                                label="Your answer:"
                            />
                            <PlaygroundOrderingResult
                                canvasData={canvasData}
                                items={question.question.items}
                                orderedIds={question.question.correctOrder}
                                label="Correct order:"
                            />
                        </div>
                    );
                }

                // Drag-and-drop ordering (sorting) — show node rows
                return (
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-500 block mb-2">
                                Your answer:
                            </span>
                            <OrderingResultDisplay
                                items={question.question.items}
                                orderedIds={userOrder}
                                correctOrder={question.question.correctOrder}
                                variant={nodeVariant}
                            />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500 block mb-2">
                                Correct order:
                            </span>
                            <OrderingResultDisplay
                                items={question.question.items}
                                orderedIds={question.question.correctOrder}
                                variant={nodeVariant}
                            />
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    return (
        <div className={`bg-white min-h-screen w-full ${className}`}>
            <div className="max-w-[1440px] mx-auto sm:px-8 sm:py-8">
                {/* Progress Navbar - Complete */}
                <TrackProgress
                    current={totalQuestions}
                    total={totalQuestions}
                    title={posttest.title}
                    isComplete={true}
                    className="mb-10"
                />

                {/* Score display */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-md px-6 py-4 text-center">
                        <p className="text-sm text-gray-500 font-medium mb-1">Your Score</p>
                        <p className="text-3xl font-bold text-[#222121]">
                            {totalScore}/{totalQuestions}
                        </p>
                    </div>
                </div>

                {/* All Questions with Results */}
                <div className="space-y-10 px-8">
                    {selectedQuestions.map((question, questionIndex) => {
                        const answer = userAnswers.find(
                            (a) => a.questionId === question.id
                        );
                        const score = getQuestionScore(question);

                        return (
                            <div key={question.id} className="space-y-4">
                                {/* Question Header with Score */}
                                <div className="flex items-start justify-between gap-4">
                                    <p className="text-[#222121] text-base md:text-lg font-semibold">
                                        <span>{questionIndex + 1}.</span> {question.text}
                                    </p>
                                    <div
                                        className={`shrink-0 px-3 py-1 border rounded-lg text-sm font-medium ${score === 1
                                            ? "border-green-300 text-green-600 bg-green-50"
                                            : "border-red-300 text-red-600 bg-red-50"
                                            }`}
                                    >
                                        {score}/1
                                    </div>
                                </div>

                                {/* Answer display */}
                                {answer && renderAnswerDisplay(question, answer)}
                            </div>
                        );
                    })}
                </div>

                {/* Go to Home Button */}
                <div className="flex justify-end mt-10 pb-8">
                    <button
                        onClick={onGoHome}
                        className="px-8 py-3 bg-[#0066cc] text-white font-medium text-base rounded-lg hover:bg-[#0052a3] transition-colors cursor-pointer"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PosttestResultPage;
