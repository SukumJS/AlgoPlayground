"use client";

import React from "react";
import ChoiceCard from "@/src/components/pretest/ChoiceCard";
import FillBlankInput from "./FillBlankInput";
import OrderingQuestion from "./OrderingQuestion";
import PlaygroundOrderingQuestion from "./PlaygroundOrderingQuestion";
import { PosttestQuestion, PosttestUserAnswer } from "@/src/app/types/posttest";

type PosttestQuestionRendererProps = {
  question: PosttestQuestion;
  answer: PosttestUserAnswer;
  onAnswer: (answer: PosttestUserAnswer) => void;
  algoType: string; // "sorting" | "tree" | "graph" etc.
  disabled?: boolean;
};

function PosttestQuestionRenderer({
  question,
  answer,
  onAnswer,
  algoType,
  disabled = false,
}: PosttestQuestionRendererProps) {
  const nodeVariant = algoType === "sorting" ? "square" : "circle";

  switch (question.type) {
    case "multiple_choice":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {question.question.multipleChoice.choices.map((choice) => (
            <ChoiceCard
              key={choice.id}
              id={choice.id}
              text={choice.text}
              isSelected={answer.selectedChoiceId === choice.id}
              disabled={disabled}
              onSelect={(choiceId) =>
                onAnswer({
                  ...answer,
                  selectedChoiceId: choiceId,
                })
              }
            />
          ))}
        </div>
      );

    case "fill_blank":
      return (
        <FillBlankInput
          value={answer.filledAnswer || ""}
          onChange={(value) =>
            onAnswer({
              ...answer,
              filledAnswer: value,
            })
          }
          disabled={disabled}
        />
      );

    case "ordering": {
      const canvasData = question.question.canvasData;

      // If canvasData exists → render ReactFlow canvas (tree/graph)
      if (canvasData) {
        return (
          <PlaygroundOrderingQuestion
            canvasData={canvasData}
            items={question.question.items}
            selectedOrder={answer.orderedItems || []}
            onOrderChange={(newOrder) =>
              onAnswer({
                ...answer,
                orderedItems: newOrder,
              })
            }
            disabled={disabled}
          />
        );
      }

      // Otherwise → drag-and-drop sorting
      return (
        <OrderingQuestion
          items={question.question.items}
          currentOrder={
            answer.orderedItems ||
            question.question.items.map((item) => item.id)
          }
          onReorder={(newOrder) =>
            onAnswer({
              ...answer,
              orderedItems: newOrder,
            })
          }
          variant={nodeVariant}
          disabled={disabled}
        />
      );
    }

    default:
      return null;
  }
}

export default PosttestQuestionRenderer;
