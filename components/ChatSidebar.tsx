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

import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { PlusIcon, Search } from "lucide-react";

// Conversation history structure (empty by default)
const conversationHistory: ConversationGroup[] = [
	{
		period: "Today",
		conversations: [],
	},
	{
		period: "Yesterday",
		conversations: [],
	},
	{
		period: "Last 7 days",
		conversations: [],
	},
	{
		period: "Last month",
		conversations: [],
	},
];

// Conversation structure for sidebar
interface Conversation {
	id: string;
	title: string;
	lastMessage: string;
	timestamp: number;
}

interface ConversationGroup {
	period: string;
	conversations: Conversation[];
}

export function ChatSidebar() {
	return (
		<Sidebar>
			<SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
				<a
					href="https://agentbase.sh"
					target="_blank"
					rel="noopener noreferrer"
					className="flex flex-row items-center gap-2 px-2 hover:opacity-80 transition-opacity"
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="https://www.agentbase.sh/logos/agentbase.svg"
						alt="Agentbase"
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
					>
						<PlusIcon className="size-4" />
						<span>New Chat</span>
					</Button>
				</div>
				{conversationHistory.map((group) => (
					<SidebarGroup key={group.period}>
						<SidebarGroupLabel>{group.period}</SidebarGroupLabel>
						<SidebarMenu>
							{group.conversations.length === 0 ? (
								<div className="px-2 py-1 text-sm text-muted-foreground">
									No conversations yet
								</div>
							) : (
								group.conversations.map((conversation) => (
									<SidebarMenuButton key={conversation.id}>
										<span>{conversation.title}</span>
									</SidebarMenuButton>
								))
							)}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	);
}
