import { Message } from "@/components/prompt-kit/message";
import { TypingLoader } from "@/components/prompt-kit/loader";

// Enhanced loading component with typing animation
export function LoadingMessage() {
	return (
		<Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-1 px-6">
			<div className="flex flex-col gap-2">
				{/* Typing indicator */}
				<div className="flex items-center gap-2">
					<TypingLoader size="sm" className="text-muted-foreground" />
					<span className="text-sm text-muted-foreground font-medium">
						Agent is thinking...
					</span>
				</div>

				{/* Optional: Show what the agent might be doing */}
				<div className="text-xs text-muted-foreground/70">
					Analyzing your prompt and acting...
				</div>
			</div>
		</Message>
	);
}
