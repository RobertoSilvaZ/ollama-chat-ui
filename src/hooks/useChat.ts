import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { db } from "../db";
import type { Message } from "../db";
import type { BotProfile } from "../components/BotProfileModal";

export function useChat(currentTopicId: number | null, selectedModel: string) {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const buildPrompt = (
    userInput: string,
    messages: Message[] | undefined,
    botProfile: BotProfile
  ): string => {
    let fullPrompt = botProfile.systemPrompt + "\n\n";

    if (messages) {
      const contextMessages = messages.slice(-5);
      for (const msg of contextMessages) {
        fullPrompt += `${msg.isUser ? "User" : "Assistant"}: ${msg.content}\n`;
      }
    }

    fullPrompt += `User: ${userInput}\nAssistant:`;

    return fullPrompt;
  };

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast.success("Request cancelled");
    }
  };

  const sendMessage = async (
    content: string,
    messages: Message[] | undefined,
    botProfile: BotProfile
  ) => {
    if (!content.trim() || !currentTopicId || isLoading) return;

    setIsLoading(true);
    let userMessage: number | undefined;
    abortControllerRef.current = new AbortController();

    try {
      userMessage = (await db.messages.add({
        topicId: currentTopicId,
        content,
        isUser: true,
        modelId: selectedModel,
        createdAt: new Date(),
      })) as number;

      const response = await fetch(
        `${import.meta.env.VITE_OLLAMA_API_URL}/api/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: buildPrompt(content, messages, botProfile),
            stream: false,
            temperature: botProfile.temperature,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from model");
      }

      const data = await response.json();

      await db.messages.add({
        topicId: currentTopicId,
        content: data.response,
        isUser: false,
        modelId: selectedModel,
        createdAt: new Date(),
      });

      if (!messages?.length) {
        await db.topics.update(currentTopicId, {
          title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was cancelled, no need for error toast
      } else {
        toast.error("Failed to send message");
        console.error("Error:", error);
        if (userMessage) {
          await db.messages.delete(userMessage);
        }
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return { isLoading, sendMessage, cancelRequest };
}
