// @/lib/agentClient.ts
import { Agentbase } from "agentbase-sdk";

let agentbase: Agentbase | null = null;

export function getAgentbaseClient(): Agentbase {
	if (agentbase) return agentbase;

	const apiKey = process.env.AGENTBASE_API_KEY;
	if (!apiKey) {
		throw new Error("AGENTBASE_API_KEY not found in environment variables");
	}

	agentbase = new Agentbase({ apiKey });
	return agentbase;
}
