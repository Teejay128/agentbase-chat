/**
 * Agentbase Chat - Home Page
 *
 * Open-source Next.js chat application template powered by Agentbase AI agents.
 * Original template by Agentbase - https://agentbase.sh
 */

"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatContent } from "@/components/ChatContent";

export default function Home() {
	return (
		<SidebarProvider>
			<ChatSidebar />
			<SidebarInset>
				<ChatContent />
			</SidebarInset>
		</SidebarProvider>
	);
}
