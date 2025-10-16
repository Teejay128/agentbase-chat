import { useState } from "react";

import {
	Message,
	MessageContent,
	MessageActions,
	MessageAction,
} from "@/components/prompt-kit/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";

import { Button } from "@/components/ui/button";
import { TypingLoader } from "@/components/prompt-kit/loader";
import { Tool } from "@/components/ui/tool";
import { AlertTriangle, ThumbsDown, ThumbsUp } from "lucide-react";

export function LoadingMessage() {
	return (
		<Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-1 px-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<TypingLoader size="sm" className="text-muted-foreground" />
					<span className="text-sm text-muted-foreground font-medium">
						Agent is thinking...
					</span>
				</div>

				<div className="text-xs text-muted-foreground/70">
					Analyzing your prompt and acting...
				</div>
			</div>
		</Message>
	);
}

export function ErrorMessage({ errorMessage }: { errorMessage: string }) {
	return (
		<Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-6">
			<div className="group flex w-full flex-col items-start gap-0">
				<div className="text-primary flex min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border-2 border-red-300 bg-red-300/20 px-2 py-1">
					<AlertTriangle size={16} className="text-red-500" />
					<p className="text-red-500">{errorMessage}</p>
				</div>
			</div>
		</Message>
	);
}

export function UserMessage({ content }: { content?: string }) {
	if (!content) return null;
	return (
		<Message className="mx-auto flex w-full max-w-3xl flex-col items-end px-2 sm:px-4 md:px-6 py-6">
			<div className="group flex w-full flex-col items-end">
				<MessageContent
					markdown
					className="bg-muted text-sm leading-relaxed max-w-[85%] rounded-3xl px-5 py-2 whitespace-pre-wrap sm:max-w-[75%]"
				>
					{content}
				</MessageContent>
			</div>
		</Message>
	);
}

export function AgentThinking({ content }: { content?: string }) {
	if (!content) return null;

	return (
		<div className="mx-auto w-full max-w-3xl px-2 sm:px-4 md:px-6 pb-3">
			<Reasoning>
				<ReasoningTrigger className="ml-2 text-sm text-muted-foreground hover:bg-muted/50 px-2 py-1 rounded-md cursor-pointer transition-colors">
					Show thinking...
				</ReasoningTrigger>

				<ReasoningContent className="ml-4 border-l-2 border-l-slate-200 px-2 pb-1 dark:border-l-slate-700">
					{content}
				</ReasoningContent>
			</Reasoning>
		</div>
	);
}

export function AgentToolUse({ content }: { content?: string }) {
	if (!content) return null;

	let toolName: string;
	let toolInput;

	try {
		const parsedContent = JSON.parse(content);
		toolName = parsedContent.tool || "Unknown Tool";

		try {
			toolInput =
				typeof parsedContent.input === "string"
					? JSON.parse(parsedContent.input)
					: parsedContent.input;
		} catch {
			toolInput = {
				error: "Unable to parse tool input, but the tool executed successfully.",
				rawInput: parsedContent.input || null,
			};
		}
	} catch {
		toolName = "Tool Execution (Parse Error)";
		toolInput = {
			error: "There was an error displaying the tool's output. The tool ran successfully, but its data could not be parsed.",
		};
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-2 sm:px-4 md:px-6">
			<Tool
				className="my-0.5 border-none text-xs text-muted-foreground/80 
      [&_*]:text-xs [&_*]:leading-snug [&_code]:text-[10px] [&_pre]:text-[11px]"
				toolPart={{
					type: toolName,
					state: "output-available",
					input: toolInput,
				}}
			/>
		</div>
	);
}

export function AgentResponse({ content }: { content?: string }) {
	if (!content) return null;

	return (
		<div className="mx-auto w-full max-w-3xl px-2 sm:px-4 md:px-6">
			<MessageContent
				markdown
				className="bg-transparent py-0 text-sm leading-relaxed"
			>
				{content}
			</MessageContent>
		</div>
	);
}

export function AgentCost({
	cost,
	balance,
}: {
	cost?: number | string;
	balance?: number | string;
}) {
	if (cost === undefined || balance === undefined) return null;

	const formattedCost =
		typeof cost === "number"
			? cost.toFixed(4)
			: parseFloat(cost.toString()).toFixed(4);

	const formattedBalance =
		typeof balance === "number" ? balance.toFixed(2) : balance;

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-2 text-[10px] text-muted-foreground/60 text-left italic select-none">
			(-${formattedCost}) • Bal: ${formattedBalance}
		</div>
	);
}

export function AgentCompleted() {
	const [liked, setLiked] = useState<boolean | null>(null);

	return (
		<div className="mx-auto w-full max-w-xl px-2 sm:px-4 md:px-6">
			<MessageActions className="flex w-full justify-end gap-3">
				<MessageAction tooltip="Helpful">
					<Button
						variant="ghost"
						size="icon"
						className={`h-6 w-6 rounded-full p-0.5 ${
							liked === true
								? "bg-green-100 text-green-500"
								: "text-muted-foreground hover:text-green-300"
						}`}
						onClick={() => setLiked(true)}
					>
						<ThumbsUp className="size-4" />
					</Button>
				</MessageAction>

				<MessageAction tooltip="Not helpful">
					<Button
						variant="ghost"
						size="icon"
						className={`h-6 w-6 rounded-full p-0.5 ${
							liked === false
								? "bg-red-100 text-red-500"
								: "text-muted-foreground hover:text-red-300"
						}`}
						onClick={() => setLiked(false)}
					>
						<ThumbsDown className="size-4" />
					</Button>
				</MessageAction>
			</MessageActions>
		</div>
	);
}
