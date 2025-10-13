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
	AgentMessage,
} from "@/components/ChatMessages";

import { SessionMessage } from "@/lib/types";

interface ChatContentProps {
	sessionMessages: SessionMessage[];
	isLoading: boolean;
	errorMessage: string;
}

export function ChatContent({
	sessionMessages,
	isLoading,
	errorMessage,
}: ChatContentProps) {
	const chatContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [sessionMessages]);

	return (
		<div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
			<ChatContainerRoot>
				<ChatContainerContent className="px-5 py-12">
					{sessionMessages.map((message) =>
						message.type == "user_message" && message.content ? (
							<UserMessage
								key={`user-${Date.now()}-${Math.random()}`}
								content={message.content}
							/>
						) : (
							<div
								className="animate-fade-in"
								key={`agent-${Date.now()}-${Math.random()}`}
							>
								<AgentMessage response={message} />
							</div>
						)
					)}

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
