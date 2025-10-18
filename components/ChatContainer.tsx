"use client";

import { useEffect, useRef } from "react";

import {
	ChatContainerContent,
	ChatContainerRoot,
} from "@/components/prompt-kit/chat-container";
import { ScrollButton } from "@/components/prompt-kit/scroll-button";

import {
	LoadingMessage,
	ErrorMessage,
	UserMessage,
	AgentThinking,
	AgentToolUse,
	AgentResponse,
	AgentCost,
	AgentCompleted,
} from "@/components/ChatMessages";

import { SessionMessage } from "@/lib/types";

interface ChatContainerProps {
	sessionMessages: SessionMessage[];
	isLoading: boolean;
	errorMessage: string;
}

export function ChatContainer({
	sessionMessages,
	isLoading,
	errorMessage,
}: ChatContainerProps) {
	const chatContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = chatContainerRef.current;
		if (!container) return;

		const isNearBottom =
			container.scrollHeight -
				container.scrollTop -
				container.clientHeight <
			150;

		if (isNearBottom) {
			container.scrollTo({
				top: container.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [sessionMessages]);

	return (
		<div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
			<ChatContainerRoot>
				<ChatContainerContent className="mx-auto w-full px-2 py-6 flex flex-col space-y-3 animate-fadeIn transition-all duration-300">
					{sessionMessages.map((message, index) => {
						switch (message.type) {
							case "user_message":
								return (
									<UserMessage
										key={`user-${index}`}
										content={message.content}
									/>
								);
							case "agent_thinking":
								return (
									<AgentThinking
										key={`thinking-${index}`}
										content={message.content}
									/>
								);
							case "agent_tool_use":
								return (
									<AgentToolUse
										key={`tool-${index}`}
										content={message.content}
									/>
								);
							case "agent_response":
								return (
									<AgentResponse
										key={`response-${index}`}
										content={message.content}
									/>
								);
							case "agent_cost":
								return (
									<AgentCost
										key={`cost-${index}`}
										cost={message.cost}
										balance={message.balance}
									/>
								);
							case "agent_completed":
								return (
									<AgentCompleted
										key={`completed-${index}`}
									/>
								);
							default:
								return null;
						}
					})}

					{isLoading && <LoadingMessage />}
					{errorMessage && (
						<ErrorMessage errorMessage={errorMessage} />
					)}
				</ChatContainerContent>
				<div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
					<ScrollButton className="shadow-sm" />
				</div>
			</ChatContainerRoot>
		</div>
	);
}
