/**
 * Agentbase Chat Application - Main Component
 *
 * This chat interface demonstrates the power of Agentbase AI agents.
 * Template originally created by Agentbase - https://agentbase.sh
 *
 * Features:
 * - Real-time AI chat with tool usage
 * - Source link integration
 * - Cost tracking and session management
 *
 * Powered by Agentbase SDK: https://docs.agentbase.sh
 */

"use client";

import {
	ChatContainerContent,
	ChatContainerRoot,
} from "@/components/prompt-kit/chat-container";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageContent,
} from "@/components/prompt-kit/message";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { ScrollButton } from "@/components/prompt-kit/scroll-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowUp, Copy, Square, AlertTriangle } from "lucide-react";
import { useRef, useState } from "react";

import { AgentMessage } from "./AgentMessage";
import { LoadingMessage } from "./LoadingMessage";

// Simple types that work with SDK responses
interface ChatMessage {
	id: string;
	type: "user" | "agent" | "system";
	content: string;
	timestamp: Date;
}

// SDK response shape (from Agentbase)
interface SDKResponse {
	type: string;
	content?: string;
	session?: string;
	cost?: number;
	balance?: number;
	tool_name?: string;
	tool_input?: Record<string, unknown>;
	tool_output?: Record<string, unknown>;
	tool_call_id?: string;
	error?: string;
}

// Use SDK response directly - much simpler!
interface AgentResponse {
	id: string;
	messages: SDKResponse[]; // SDK response objects
	isComplete: boolean;
	timestamp: Date;
}

export function ChatContent() {
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [completedResponses, setCompletedResponses] = useState<
		AgentResponse[]
	>([]);
	const [currentAgentResponse, setCurrentAgentResponse] =
		useState<AgentResponse | null>(null);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const handlePromptChange = (value: string) => {
		setPrompt(value);
	};
	const handleSubmit = async () => {
		if (!prompt.trim() || isLoading) return;

		const userMessage: ChatMessage = {
			id: `user-${Date.now()}`,
			type: "user",
			content: prompt.trim(),
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, userMessage]);
		setPrompt("");
		setIsLoading(true);
		setError(null);
		setCurrentAgentResponse(null);

		try {
			// Simple fetch to our API route
			const response = await fetch("/api/agent", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: userMessage.content,
					...(sessionId && { session: sessionId }),
					mode: "fast",
				}),
			});

			if (!response.ok) {
				let errorMessage = `HTTP error! status: ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorMessage;
				} catch {
					// If we can't parse JSON, response is likely HTML error page
					const text = await response.text();
					errorMessage = `Server error (${
						response.status
					}): ${text.substring(0, 100)}...`;
				}
				throw new Error(errorMessage);
			}

			// Get complete response from SDK (no streaming)
			let sdkResponses;
			try {
				sdkResponses = await response.json();
			} catch {
				const text = await response.text();
				throw new Error(
					`Failed to parse JSON response: ${text.substring(
						0,
						100
					)}...`
				);
			}

			// Extract session ID from the first agent_started response
			const sessionResponse = sdkResponses.find(
				(r: SDKResponse) => r.type === "agent_started"
			);
			if (sessionResponse?.session) {
				setSessionId(sessionResponse.session);
			}

			// Create agent response with all SDK responses
			const completedResponse: AgentResponse = {
				id: `agent-${Date.now()}`,
				messages: Array.isArray(sdkResponses)
					? sdkResponses
					: [sdkResponses],
				isComplete: true,
				timestamp: new Date(),
			};

			// Add to completed responses history
			setCompletedResponses((prev) => [...prev, completedResponse]);

			// Auto-scroll
			if (chatContainerRef.current) {
				chatContainerRef.current.scrollTop =
					chatContainerRef.current.scrollHeight;
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="flex h-screen flex-col overflow-hidden">
			<header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-3 border-b px-4">
				<SidebarTrigger className="-ml-1" />
			</header>

			<div
				ref={chatContainerRef}
				className="relative flex-1 overflow-y-auto"
			>
				<ChatContainerRoot className="h-full">
					<ChatContainerContent className="space-y-8 px-5 py-12">
						{/* Show initial prompt if no messages */}
						{chatMessages.length === 0 &&
							completedResponses.length === 0 &&
							!currentAgentResponse && (
								<div className="mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 md:px-5 md:pb-5">
									<div className="text-foreground mb-2 font-medium">
										Try asking:
									</div>
									<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
										<li>What can you help me with?</li>
										<li>Explain React components</li>
										<li>Help me debug this code</li>
									</ul>
								</div>
							)}

						{/* Render conversation history (user messages + completed agent responses) */}
						{chatMessages.map((message, index) => (
							<div key={`conversation-${index}`}>
								{/* User message */}
								<Message
									key={message.id}
									className="mx-auto flex w-full max-w-3xl flex-col items-end gap-2 px-6"
								>
									<div className="group flex w-full flex-col items-end gap-2">
										<MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 whitespace-pre-wrap sm:max-w-[75%]">
											{message.content}
										</MessageContent>
										<MessageActions className="flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
											<MessageAction
												tooltip="Copy"
												delayDuration={100}
											>
												<Button
													variant="ghost"
													size="icon"
													className="rounded-full"
												>
													<Copy />
												</Button>
											</MessageAction>
										</MessageActions>
									</div>
								</Message>

								{/* Corresponding agent response (if exists) */}
								{completedResponses[index] && (
									<div className="animate-fade-in">
										<AgentMessage
											response={completedResponses[index]}
										/>
									</div>
								)}
							</div>
						))}

						{/* Render current streaming agent response */}
						{currentAgentResponse && (
							<div className="animate-fade-in">
								<AgentMessage response={currentAgentResponse} />
							</div>
						)}

						{/* Show loading when waiting for stream */}
						{isLoading && !currentAgentResponse && (
							<LoadingMessage />
						)}

						{/* Show error message */}
						{error && (
							<Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-6">
								<div className="group flex w-full flex-col items-start gap-0">
									<div className="text-primary flex min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border-2 border-red-300 bg-red-300/20 px-2 py-1">
										<AlertTriangle
											size={16}
											className="text-red-500"
										/>
										<p className="text-red-500">{error}</p>
									</div>
								</div>
							</Message>
						)}
					</ChatContainerContent>
					<div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
						<ScrollButton className="shadow-sm" />
					</div>
				</ChatContainerRoot>
			</div>

			<div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
				<div className="mx-auto max-w-3xl">
					<PromptInput
						value={prompt}
						onValueChange={handlePromptChange}
						isLoading={isLoading}
						onSubmit={handleSubmit}
						className="w-full border-input bg-popover border rounded-3xl shadow-xs"
					>
						<PromptInputTextarea
							placeholder="Ask me anything..."
							className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3]"
						/>
						<PromptInputActions className="justify-end pt-2 pr-2 pb-2">
							<PromptInputAction
								tooltip={
									isLoading
										? "Stop generation"
										: "Send message"
								}
							>
								<Button
									variant="default"
									size="icon"
									className="h-8 w-8 rounded-full"
									disabled={!prompt.trim() || isLoading}
									onClick={handleSubmit}
								>
									{isLoading ? (
										<Square className="size-5 fill-current" />
									) : (
										<ArrowUp className="size-5" />
									)}
								</Button>
							</PromptInputAction>
						</PromptInputActions>
					</PromptInput>
				</div>
			</div>
		</main>
	);
}
