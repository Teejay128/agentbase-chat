/**
 * Agentbase Chat - Home Page
 *
 * Open-source Next.js chat application template powered by Agentbase AI agents.
 * Original template by Agentbase - https://agentbase.sh
 */

"use client";

import React, { useState, useEffect } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Popover } from "@/components/ui/popover";

import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatContainer } from "@/components/ChatContainer";
import { ChatConfig } from "@/components/ChatConfig";

import { SessionMessage, Session, AgentMode } from "@/lib/types";
import { readSessionList, writeSessionList } from "@/lib/localStorage";
import { fetchSessionMessages, fetchAgentResponse } from "@/lib/api";

export default function FullChatApp() {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessionList, setSessionList] = useState<Session[]>([]);
	const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>(
		[]
	);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	const [agentMode, setAgentMode] = useState<AgentMode>("fast");
	const [agentSystem, setAgentSystem] = useState<string>("");
	const [agentRules, setAgentRules] = useState<string[]>([]);

	const newConversation = () => {
		setSessionId(null);
		setSessionMessages([]);
		setIsLoading(false);
	};

	const createNewSession = async (
		newSessionId: string,
		agentResponse: SessionMessage
	) => {
		const exists = sessionList.some((s) => s.id === newSessionId);
		if (exists) return;

		const sessionTitle =
			`${agentResponse.content?.substring(0, 40)}...` ||
			`Session-${newSessionId}`;

		const newSession = {
			id: newSessionId,
			title: sessionTitle,
			timestamp: Date.now(),
		};

		setSessionId(newSessionId);
		setSessionList((prev) => [newSession, ...prev]);
	};
	// const createNewSession = async (
	// 	newSessionId: string,
	// 	agentResponse: SessionMessage[]
	// ) => {
	// 	const exists = sessionList.some((s) => s.id === newSessionId);
	// 	if (exists) return;

	// 	const agentReply = agentResponse.find(
	// 		(item) => item.type === "agent_response" && item.content
	// 	);
	// 	const sessionTitle = agentReply
	// 		? `${agentReply.content?.substring(0, 40)}...`
	// 		: `Session-${newSessionId}`;

	// 	const newSession = {
	// 		id: newSessionId,
	// 		title: sessionTitle,
	// 		timestamp: Date.now(),
	// 	};

	// 	setSessionId(newSessionId);
	// 	setSessionList((prev) => [newSession, ...prev]);
	// };

	const switchSession = async (session: Session) => {
		if (session.id === sessionId) return;
		try {
			const fetchedMessages = await fetchSessionMessages(session.id);

			setSessionId(session.id);
			setSessionMessages(fetchedMessages);
		} catch (error) {
			throw new Error("Function not implemented:" + error);
		}
	};

	const handleSubmit = async (prompt: string) => {
		if (!prompt.trim() || isLoading) return;

		const userMessage: SessionMessage = {
			type: "user_message",
			content: prompt.trim(),
		};

		setSessionMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);
		setErrorMessage("");

		if (!userMessage.content) return;

		try {
			await fetchAgentResponse({
				message: userMessage.content,
				sessionId,
				agentMode,
				agentSystem,
				agentRules,
				onChunk: (msg: SessionMessage) => {
					if (
						msg.session &&
						msg.session !== sessionId &&
						msg.type == "agent_response"
					) {
						const newSessionId = msg.session;
						createNewSession(newSessionId, msg);
					}

					setSessionMessages((prev) => [...prev, msg]);
				},
			});
		} catch (err) {
			setErrorMessage(
				err instanceof Error ? err.message : "An error occurred"
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		setSessionList(readSessionList());
	}, []);

	useEffect(() => {
		writeSessionList(sessionList);
	}, [sessionList]);

	return (
		<SidebarProvider>
			<Popover>
				<ChatSidebar
					sessionId={sessionId}
					sessionList={sessionList}
					switchSession={switchSession}
					newConversation={newConversation}
				/>
				<SidebarInset>
					<ChatConfig
						agentMode={agentMode}
						setAgentMode={setAgentMode}
						agentSystem={agentSystem}
						setAgentSystem={setAgentSystem}
						agentRules={agentRules}
						setAgentRules={setAgentRules}
					/>
					<main className="flex h-screen flex-col overflow-hidden">
						<ChatHeader newConversation={newConversation} />
						<ChatContainer
							sessionMessages={sessionMessages}
							isLoading={isLoading}
							errorMessage={errorMessage}
						/>
						<ChatInput
							sessionId={sessionId}
							isLoading={isLoading}
							handleSubmit={handleSubmit}
						/>
					</main>
				</SidebarInset>
			</Popover>
		</SidebarProvider>
	);
}
