import { SidebarTrigger } from "@/components/ui/sidebar";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "./ui/button";

export function ChatHeader() {
	return (
		<header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-3 border-b px-4">
			<SidebarTrigger className="-ml-1" />
			<div className="flex-grow text-sm font-medium text-muted-foreground truncate">
				Agentbase
			</div>
			<PopoverTrigger asChild className="ml-1">
				<Button variant="outline">Options</Button>
			</PopoverTrigger>
		</header>
	);
}
