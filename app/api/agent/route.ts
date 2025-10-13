import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentbase";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { message, session, mode, system, rules } = body;

		// Validate required fields
		if (!message) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}

		const agentbase = getAgentbaseClient();

		// Use real Agentbase SDK with streaming disabled
		const params = {
			message,
			...(session && { session }),
			...(mode && { mode }),
			...(system && { system }),
			...(rules && { rules }),
			streaming: false, // Disable streaming for complete responses
		};

		const agentStream = await agentbase.runAgent(params);

		// Collect all responses from the stream (even with streaming: false)
		const responses = [];
		for await (const response of agentStream) {
			responses.push(response);
		}

		// Return all responses
		return NextResponse.json(responses);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
