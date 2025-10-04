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

import { Message, MessageContent } from "@/components/prompt-kit/message";
import { TypingLoader } from "@/components/prompt-kit/loader";
import { SourceLinks } from "@/components/ui/source-links";
import { ToolUsage } from "@/components/ui/tool-usage";

// SDK response shape (from Agentbase)
interface SDKResponse {
	type: string;
	content?: string;
	session?: string;
	cost?: number;
	balance?: number;
	tool_name?: string;
	tool_input?: Record<string, unknown>;
	tool_output?: Record<string, unknown>;
	tool_call_id?: string;
	error?: string;
}

// Use SDK response directly - much simpler!
interface AgentResponse {
	id: string;
	messages: SDKResponse[]; // SDK response objects
	isComplete: boolean;
	timestamp: Date;
}

// Simplified agent message component using SDK responses directly
export function AgentMessage({ response }: { response: AgentResponse }) {
	// Filter out ALL thinking and planning events, only show final responses
	const filteredMessages = response.messages.filter(
		(m) =>
			m.type !== "agent_thinking" &&
			m.type !== "agent_thinking_start" &&
			m.type !== "agent_response_start" &&
			m.type !== "agent_tool_use_start" &&
			m.type !== "agent_started" &&
			m.type !== "agent_step" &&
			m.type !== "agent_completed"
	);

	const toolUse = filteredMessages.filter((m) => m.type === "agent_tool_use");
	const toolResults = filteredMessages.filter(
		(m) => m.type === "agent_tool_response"
	);
	const content = filteredMessages
		.filter((m) => m.type === "agent_response")
		.map((m) => m.content)
		.join("\n");

	const costInfo = filteredMessages.find((m) => m.type === "agent_cost");
	const error = filteredMessages.find((m) => m.type === "error")?.content;

	// Extract source URLs from tool responses
	const extractSourceUrls = (): string[] => {
		const urls: string[] = [];

		// Look for URLs in tool results
		toolResults.forEach((result) => {
			// The SDK returns tool response content as a JSON string, not an object
			if (result.content) {
				try {
					const parsedContent = JSON.parse(result.content);

					// Handle web tool responses
					if (
						parsedContent.tool === "web" &&
						parsedContent.response
					) {
						if (Array.isArray(parsedContent.response)) {
							parsedContent.response.forEach((item: unknown) => {
								const urlItem = item as { url?: string };
								if (
									urlItem.url &&
									typeof urlItem.url === "string"
								) {
									urls.push(urlItem.url);
								}
							});
						}
					}
				} catch {
					// Fallback: extract URLs with regex from the string
					const urlRegex = /https?:\/\/[^\s)]+/g;
					const foundUrls = result.content.match(urlRegex) || [];
					urls.push(...foundUrls);
				}
			}
		});

		return urls;
	};

	const sourceUrls = extractSourceUrls();

	return (
		<Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-1 px-6">
			{/* Tool usage */}
			<ToolUsage toolUse={toolUse} />

			{/* Main response */}
			{content && (
				<MessageContent markdown className="bg-transparent p-0">
					{content + (!response.isComplete ? "▋" : "")}
				</MessageContent>
			)}

			{/* Show loading indicator if streaming and no content yet */}
			{!response.isComplete && !content && (
				<div className="flex items-center gap-2 py-2">
					<TypingLoader size="sm" className="text-muted-foreground" />
					<span className="text-sm text-muted-foreground font-medium">
						Generating response...
					</span>
				</div>
			)}

			{/* Cost info */}
			{costInfo && (
				<div className="text-xs text-muted-foreground mt-6">
					💰 Cost: $
					{typeof costInfo.cost === "number"
						? costInfo.cost.toFixed(4)
						: costInfo.cost}{" "}
					| Balance: $
					{typeof costInfo.balance === "number"
						? costInfo.balance.toFixed(2)
						: costInfo.balance}
				</div>
			)}

			{/* Error */}
			{error && (
				<div className="text-sm text-red-600 mt-6">⚠️ {error}</div>
			)}

			{/* Source Links */}
			<SourceLinks urls={sourceUrls} />
		</Message>
	);
}
