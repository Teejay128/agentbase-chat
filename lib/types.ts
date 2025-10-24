export type AgentMode = "flash" | "fast" | "max";

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

export interface SendMessageParams {
	message: string;
	sessionId?: string | null;
	agentMode?: string;
	agentSystem?: string;
	agentRules?: string[];
	onChunk: (msg: SessionMessage) => void;
}

export interface Session {
	id: string;
	title: string;
	timestamp: number;
}
