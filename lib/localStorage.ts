import { Session } from "@/lib/types";

const SESSION_LIST_KEY = "chat_conversation_history";
const initialSessionList: Session[] = [];

export const readSessionList = (): Session[] => {
	if (typeof window === "undefined") return initialSessionList;
	try {
		const storedList = localStorage.getItem(SESSION_LIST_KEY);
		return storedList ? JSON.parse(storedList) : initialSessionList;
	} catch (e) {
		console.error("Error reading session list:", e);
		return initialSessionList;
	}
};

export const writeSessionList = (list: Session[]) => {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(list));
	} catch (e) {
		console.error("Error writing session list:", e);
	}
};
