import { Node, Choice, Story, User, Playthrough, Prisma } from "@prisma/client";

export type Variables = Prisma.InputJsonValue | null;

export interface MakeChoiceRequest {
  choiceId: number;
  variables?: Variables;
}

export interface PlaythroughResponse {
  id: number;
  isCompleted: boolean;
  variables: Variables | null;
  story: {
    id: number;
    title: string;
    authorName: string;
  };
  currentNode: {
    id: number;
    picture: string;
    title: string;
    content: string;
    isStart: boolean;
    isEnd: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChoiceResponse {
  id: number;
  choiceText: string;
  fromNodeId: number;
  toNode: {
    id: number;
    title: string;
    isEnd: boolean;
  };
}

export interface ProgressResponse {
  playthrough: PlaythroughResponse;
  availableChoices: ChoiceResponse[];
}
