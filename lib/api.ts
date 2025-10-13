// lib/api.ts
import { SessionMessage, SendMessageParams } from "@/lib/types";

export async function fetchAgentResponse({
	message,
	mode = "fast",
	sessionId,
	agentSystem,
	agentRules,
}: SendMessageParams): Promise<SessionMessage[]> {
	if (!message.trim()) throw new Error("Message content cannot be empty");

	const body = {
		message,
		mode,
		...(sessionId && { session: sessionId }),
		...(agentSystem && { system: agentSystem }),
		...(agentRules && agentRules.length > 0 && { rules: agentRules }),
	};

	const response = await fetch("/api/agent", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		let errorMessage = `HTTP error! status: ${response.status}`;
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			const text = await response.text();
			errorMessage = `Server error (${response.status}): ${text.substring(
				0,
				100
			)}...`;
		}
		throw new Error(errorMessage);
	}

	let agentResponse: SessionMessage[];
	try {
		agentResponse = await response.json();
	} catch {
		const text = await response.text();
		throw new Error(`Failed to parse JSON: ${text.substring(0, 100)}...`);
	}

	return agentResponse;
}

export async function fetchSessionMessages(
	sessionId: string
): Promise<SessionMessage[]> {
	if (!sessionId) throw new Error("Session ID is required");
	const response = await fetch(`/api/agent/${sessionId}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		let errorMessage = `HTTP error! status: ${response.status}`;
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			const text = await response.text();
			errorMessage = `Server error (${response.status}): ${text.substring(
				0,
				100
			)}...`;
		}
		throw new Error(errorMessage);
	}

	let messages: SessionMessage[];
	try {
		messages = await response.json();
	} catch {
		const text = await response.text();
		throw new Error(`Failed to parse JSON: ${text.substring(0, 100)}...`);
	}

	return messages;
}
