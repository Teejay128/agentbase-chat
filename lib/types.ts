// SDK response shape (from Agentbase)
export interface SessionMessage {
	type: string;
	content?: string;
	session?: string;
	cost?: string | number;
	balance?: number;
	tool_name?: string;
	tool_input?: Record<string, unknown>;
	tool_output?: Record<string, unknown>;
	tool_call_id?: string;
	error?: string;
}

export interface Session {
	id: string;
	timestamp: number;
}

export interface SendMessageParams {
	message: string;
	mode?: string;
	sessionId?: string | null;
	agentSystem?: string;
	agentRules?: string[];
}
