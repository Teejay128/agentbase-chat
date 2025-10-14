import { SidebarTrigger } from "@/components/ui/sidebar";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "./ui/button";

import { MessageSquarePlus, ChevronDown } from "lucide-react";

export function ChatHeader({
	newConversation,
}: {
	newConversation: () => void;
}) {
	return (
		<header className="bg-background z-10 flex h-16 w-full shrink-0 items-center border-b px-4">
			<div className="flex items-center">
				<SidebarTrigger className="-ml-1" />
				<PopoverTrigger asChild className="ml-1">
					<Button variant="ghost">
						<span>Base 1.0</span>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
			</div>
			<div className="ml-auto text-sm font-medium text-muted-foreground items-center">
				<Button variant="ghost" onClick={newConversation}>
					<MessageSquarePlus className="h-5 w-5" />
				</Button>
			</div>
		</header>
	);
}
