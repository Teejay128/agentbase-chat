import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentbase";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { message, session, mode, system, rules } = body;

		if (!message) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}

		const agentbase = getAgentbaseClient();

		const params = {
			message,
			...(session && { session }),
			...(mode && { mode }),
			...(system && { system }),
			...(rules && { rules }),
			streaming: false,
		};

		const agentStream = await agentbase.runAgent(params);

		const responses = [];
		for await (const response of agentStream) {
			responses.push(response);
		}

		return NextResponse.json(responses);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
