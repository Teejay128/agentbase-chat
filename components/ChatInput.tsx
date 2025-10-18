import { useEffect, useState } from "react";

import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
	sessionId: string | null;
	isLoading: boolean;
	handleSubmit: (prompt: string) => void;
}

const defaultSuggestions = [
	{
		label: "Plan a 3-day trip to Paris, France, including flights and hotels",
		value: "Plan a 3-day trip to Paris, France, including flights and hotels",
	},
	{
		label: "Write a Python script to scrape headlines from a news website",
		value: "Write a Python script to scrape headlines from a news website",
	},
	{
		label: "Compare the latest features of Next.js and SvelteKit",
		value: "Compare the latest features of Next.js and SvelteKit",
	},
];

export function ChatInput({
	sessionId,
	isLoading,
	handleSubmit,
}: ChatInputProps) {
	const [prompt, setPrompt] = useState<string>("");
	const [suggestions, setSuggestions] = useState<boolean>(true);

	useEffect(() => {
		if (sessionId) {
			setSuggestions(false);
		} else {
			setSuggestions(true);
		}
	}, [sessionId]);

	function submitPrompt() {
		setSuggestions(false);
		handleSubmit(prompt);
		setPrompt("");
	}

	return (
		<div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
			{suggestions && (
				<div className="w-full mb-32 text-sm text-muted-foreground">
					<div className="mx-auto max-w-2xl px-4 md:px-6">
						<h2 className="mb-4 text-base font-semibold text-foreground/90">
							Welcome, what can I do for you?
						</h2>

						<div className="flex flex-col gap-2 mx-auto max-w-3xl w-full my-auto">
							{defaultSuggestions.map((ssg, index) => (
								<PromptSuggestion
									key={index}
									onClick={() => setPrompt(ssg.value)}
									className="cursor-pointer rounded-lg px-4 py-2 transition-all hover:bg-accent/50 hover:text-foreground/90 break-words whitespace-pre-wrap text-left"
								>
									{ssg.label}
								</PromptSuggestion>
							))}
						</div>
					</div>
				</div>
			)}

			<div className="mx-auto max-w-3xl">
				<PromptInput
					value={prompt}
					onValueChange={(v) => setPrompt(v)}
					isLoading={isLoading}
					onSubmit={submitPrompt}
					className="w-full border-input bg-popover border rounded-3xl shadow-xs"
				>
					<PromptInputTextarea
						placeholder="Ask me anything..."
						className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3]"
					/>
					<PromptInputActions className="justify-end pt-2 pr-2 pb-2">
						<PromptInputAction tooltip="Send message">
							<Button
								variant="default"
								size="icon"
								className="h-8 w-8 rounded-full"
								disabled={!prompt.trim() || isLoading}
								onClick={submitPrompt}
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
	);
}
