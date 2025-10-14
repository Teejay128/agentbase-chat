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

import { useState } from "react";
import Image from "next/image";

import { PlusIcon, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Session } from "@/lib/types";

interface ChatSidebarProps {
	sessionId: string | null;
	sessionList: Session[];
	switchSession: (session: Session) => Promise<void>;
	newConversation: () => void;
}

export function ChatSidebar({
	sessionId,
	sessionList,
	switchSession,
	newConversation,
}: ChatSidebarProps) {
	const [loadingSessionId, setLoadingSessionId] = useState<string | null>(
		null
	);

	const handleSwitch = async (session: Session) => {
		if (loadingSessionId || sessionId == session.id) return;
		setLoadingSessionId(session.id);
		try {
			await switchSession(session);
		} finally {
			setLoadingSessionId(null);
		}
	};

	return (
		<Sidebar>
			<SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
				<a
					href="https://agentbase.sh"
					target="_blank"
					rel="noopener noreferrer"
					className="flex flex-row items-center gap-2 px-2 hover:opacity-80 transition-opacity"
				>
					<Image
						src="https://www.agentbase.sh/logos/agentbase.svg"
						alt="Agentbase"
						width={32}
						height={32}
						className="size-8"
					/>
					<div className="text-md font-base text-primary tracking-tight">
						Agentbase
					</div>
				</a>
				<Button variant="ghost" className="size-8">
					<Search className="size-4" />
				</Button>
			</SidebarHeader>
			<SidebarContent className="pt-4">
				<div className="px-4">
					<Button
						variant="outline"
						className="mb-4 flex w-full items-center gap-2"
						onClick={newConversation}
						disabled={sessionId == null}
					>
						<PlusIcon className="size-4" />
						<span>New Chat</span>
					</Button>
				</div>
				<SidebarMenu className="px-2">
					{sessionList.length === 0 ? (
						<div className="px-2 py-1 text-sm text-muted-foreground h-full">
							No sessions yet
						</div>
					) : (
						sessionList.map((session) => (
							<SidebarMenuItem key={session.id} className="p-0">
								<SidebarMenuButton
									title={`Session ID: ${session.id}`}
									isActive={sessionId == session.id}
									onClick={() => handleSwitch(session)}
								>
									<span className="text-sm font-medium">
										{session.title}
									</span>
									{loadingSessionId === session.id && (
										<Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
									)}
								</SidebarMenuButton>
							</SidebarMenuItem>
						))
					)}
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}
