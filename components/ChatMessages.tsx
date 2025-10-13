import { Message, MessageContent } from "@/components/prompt-kit/message";
import { TypingLoader } from "@/components/prompt-kit/loader";
import { AlertTriangle } from "lucide-react";

import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";
import { Separator } from "@/components/ui/separator";
import { Tool } from "@/components/ui/tool";

import { SessionMessage } from "@/lib/types";

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

export function UserMessage({ content }: { content: string }) {
	return (
		<Message className="mx-auto flex w-full max-w-3xl flex-col items-end px-6 py-6">
			<div className="group flex w-full flex-col items-end">
				<MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 whitespace-pre-wrap sm:max-w-[75%]">
					{content}
				</MessageContent>
			</div>
		</Message>
	);
}

export function AgentMessage({ response }: { response: SessionMessage }) {
	const paddingWrapperClass = "mx-auto w-full max-w-3xl px-6";

	switch (response.type) {
		case "agent_started":
		case "agent_completed":
			return (
				<div className={paddingWrapperClass}>
					<Separator className="my-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
				</div>
			);

		case "agent_thinking":
			if (!response.content) return null;
			return (
				<div className={`${paddingWrapperClass} py-2`}>
					<Reasoning>
						<ReasoningTrigger className="animate-pulse text-sm text-muted-foreground">
							Show thinking...
						</ReasoningTrigger>

						<ReasoningContent className="ml-2 border-l-2 border-l-slate-200 px-2 pb-1 dark:border-l-slate-700">
							{response.content}
						</ReasoningContent>
					</Reasoning>
				</div>
			);

		case "agent_tool_use":
			if (!response.content) return null;

			let toolName: string;
			let toolInput;

			try {
				const parsedContent = JSON.parse(response.content);

				toolName = parsedContent.tool || "Unknown Tool";

				try {
					toolInput =
						typeof parsedContent.input === "string"
							? JSON.parse(parsedContent.input)
							: parsedContent.input;
				} catch (innerError) {
					console.warn("Failed to parse tool input:", innerError);
					toolInput = {
						error: "Unable to parse tool input, but the tool executed successfully.",
						rawInput: parsedContent.input || null,
					};
				}
			} catch (outerError) {
				console.error("Failed to parse content:", outerError);

				toolName = "Tool Execution (Parse Error)";
				toolInput = {
					error: "There was an error displaying the tool's output. The tool ran successfully, but its data could not be parsed.",
				};
			}

			return (
				<div className={paddingWrapperClass}>
					<Tool
						toolPart={{
							type: toolName,
							state: "output-available",
							input: toolInput,
						}}
					/>
				</div>
			);

		case "agent_response":
			console.log("DUIHDSKJUIEHKERNJKNDFUIONUIDUIFDFIU");
			if (response.content) {
				console.log(response.content);
				return (
					<div className={paddingWrapperClass}>
						<MessageContent
							markdown
							className="bg-transparent py-0"
						>
							{response.content}
						</MessageContent>
					</div>
				);
			}
			break;

		case "agent_cost":
			if (response.cost !== undefined && response.balance !== undefined) {
				const formattedCost =
					typeof response.cost === "number"
						? response.cost.toFixed(4)
						: parseFloat(response.cost.toString()).toFixed(4);

				const formattedBalance =
					typeof response.balance === "number"
						? response.balance.toFixed(2)
						: response.balance;

				return (
					<div className={`${paddingWrapperClass} py-2`}>
						<div className="text-xs text-muted-foreground mt-2">
							(-${formattedCost}) | Balance: ${formattedBalance}
						</div>
					</div>
				);
			}
			break;

		default:
			// console.log(
			// 	`[Filtered Event] Unhandled type: ${response.type}`,
			// 	response
			// );
			break;
	}

	return null;
}
