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
				<div className="flex flex-col items-start w-full mb-48 text-sm text-muted-foreground">
					<h2 className="p-3">Try asking:</h2>
					<PromptSuggestion
						onClick={() => setPrompt("Tell me a joke")}
					>
						Tell me a funny joke
					</PromptSuggestion>

					<PromptSuggestion
						onClick={() => setPrompt("How does this work?")}
					>
						How does this work?
					</PromptSuggestion>

					<PromptSuggestion
						onClick={() => setPrompt("Generate an image of a cat")}
					>
						Generate an image of a cat
					</PromptSuggestion>

					<PromptSuggestion onClick={() => setPrompt("Write a poem")}>
						Write a poem
					</PromptSuggestion>
					<PromptSuggestion
						onClick={() => setPrompt("Code a React component")}
					>
						Code a React component
					</PromptSuggestion>
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
						<PromptInputAction
							tooltip={
								isLoading ? "Stop generation" : "Send message"
							}
						>
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
