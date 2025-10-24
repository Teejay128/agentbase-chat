import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentClient";

// GET /api/agent/[sessionId]
export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ sessionId: string }> }
) {
	try {
		const { sessionId } = await context.params;

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Missing session ID" },
				{ status: 400 }
			);
		}

		const agentbase = getAgentbaseClient();

		const retrievedMessages = await agentbase.getMessages.retrieve({
			session: sessionId,
		});

		const messages = [];
		for await (const response of retrievedMessages) {
			messages.push(response);
		}

		return NextResponse.json(messages);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
