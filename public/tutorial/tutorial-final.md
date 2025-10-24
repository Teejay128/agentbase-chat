# How to Build An AI Agent Chat App with Agentbase

## Introduction to Agentbase

AI agents extend the capabilities of reasoning models by giving them the ability to carry out multi-step tasks in external environments. The complex nature of agents raises a lot of issues in their development such as:

- Interacting with the reasoning model
- Integrating tools and services
- Managing memory and internal state
- Framework for parsing responses

Agentbase offers a **simplified** approach to building agents that abstracts all these complexties. We provide a server-side solution for managing the entire agent orchestration process, all of which is exposed through a unified API.

![Agentbase Simplicity Diagram](/tutorial/agentbase-simplicity.png)

In this tutorial, you will create an application that allows user to chat with an agent that can crawl the web and carry out multi-step research processes. You'll implement features like persistent conversation history, real-time message event streaming, and agent configuration.

*(Prequisites: Familiarity with Typescript and the Next.js App Router.)*

The user interface will be built using components from the [Shadcn](https://ui.shadcn.com/) and [Prompt Kit](https://www.prompt-kit.com/) libraries to focus solely on the Agentbase implementation.

### Making your First API Request

To interact with the Agents API we provide, you will need an API key.

1.  Navigate to the [Agentbase website](https://agentbase.sh) and sign up.
2.  Create a new Admin Token and copy the generated string.

![Agentbase Page Overview](/tutorial/agentbase-overview.png)

> Note: Registering with a work email will grant you free credits.

With an API key, you can send a direct request to the agent using a `cURL` command.

```bash
curl --request POST \
  --url https://api.agentbase.sh/ \
  --header 'Authorization: Bearer YOUR_API_KEY_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "Hi there! Greet the user and introduce yourself."
  }'
```

> Note: For Windows Command Prompt or Powershell, the single quotes (`'`) around the JSON data may need to be replaced with double quotes (`"`), and the internal double quotes must be escaped (`\"`).

### Agentbase Message Event Stream

The response you receive from the API is a series of objects known as the **message event stream**.

```json
data: {"session":"b5sssvkfykmty8e","type":"agent_started"}
data: {"session":"b5sssvkfykmty8e","type":"agent_response","content":"Hello! I'm Base, a general-purpose AI agent developed by the Agentbase team. I'm designed to help you accomplish complex tasks by reasoning, planning, and using various tools effectively. Whether you need help with coding, research, file management, or web-related tasks, I'm here to assist you. What can I help you with today?"}
data: {"session":"b5sssvkfykmty8e","type":"agent_cost","cost":"0.0174","balance":87.53800000000007,"deductionSuccess":true,"lowBalance":false}
data: {"session":"b5sssvkfykmty8e","type":"agent_step","stepNumber":1}
data: {"session":"b5sssvkfykmty8e","type":"agent_completed"}
```

The data in the stream gives you peak into the steps the agent takes to process your request.

- `agent_started`: Signals the beginning of the agent's execution
- `agent_response`: Contains the final, user-facing message from the agent.
- `agent_cost`: Details the computational cost of the request and the remaining account balance.
- `agent_completed`: Signals the end of the agent's execution for that request.

> Visit the full reference for agent event types on the [Agentbase docs](https://docs.agentbase.sh/api/message-events).

All you need to do is build an application that takes the user's request and renders each step of the agent's process in the user interface.

## Chat Application User Interface

Now that you understand how the Agentbase API works, you can begin constructing the frontend for the application.

If you would like to skip this process and go directly into the agentbase integration, clone the [section-2-static-ui]() branch, which already has the basic UI assembled, and move on to the next section.

> The rest of this section highlights the steps taken to get to the referenced branch.

### Project Setup and Dependency Installation

First, initialize the Next.js application using the `create-next-app` command.

```bash
npx create-next-app@latest chat-agentbase --typescript --tailwind --eslint
cd chat-agentbase
```

The application will rely on the following packages to streamline the development process:

1. Agentbase SDK: Let's you call methods that make requests to the Agentbase API.
2.  Shadcn/UI: Provides foundation components for building the user interface.
3.  Prompt Kit: An extension of Shadcn/UI with components specifically designed for AI applications.

Install both the packages and the required components:

```bash
# Install the core SDK
npm install agentbase-sdk

# Initialize Shadcn/UI in your project (follow the CLI prompts)
npx shadcn@latest init

# Install required Shadcn/UI components
npx shadcn@latest add avatar badge button collapsible input label popover select separator skeleton sidebar textarea tooltip

# Install required Prompt Kit components
npx shadcn@latest add "https://www.prompt-kit.com/c/chat-container.json" "https://www.prompt-kit.com/c/code-block.json" "https://www.prompt-kit.com/c/loader.json" "https://www.prompt-kit.com/c/markdown.json" "https://www.prompt-kit.com/c/message.json" "https://www.prompt-kit.com/c/prompt-input.json" "https://www.prompt-kit.com/c/prompt-suggestion.json" "https://www.prompt-kit.com/c/scroll-button.json" "https://www.prompt-kit.com/c/reasoning.json" "https://www.prompt-kit.com/c/tool.json"
```

> For more information on installation instructions, check out the respective docs for [Shadcn/UI](https://ui.shadcn.com/docs/installation/next) and [Prompt Kit](https://ui.shadcn.com/docs/installation/next)

### Assembling the Static UI

To start assembling the UI, update the main entry point of the application to render the central component `<FullChatApp>`.

```js
// app/page.tsx
import { FullChatApp } from "@/components/FullChatApp";

export default function Home() {
  return <FullChatApp />;
}
```

This component is the core of your application as it will be used to manage state, functions and organize UI elements.

```js
// components/FullChatApp.tsx
"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Popover } from "@/components/ui/popover";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatContainer } from "@/components/ChatContainer";
import { ChatConfig } from "@/components/ChatConfig";

export function FullChatApp() {
  return (
    <SidebarProvider>
      <Popover>
        <ChatSidebar />
	        <SidebarInset>
          <ChatConfig />
          <main className="flex h-screen flex-col overflow-hidden">
            <ChatHeader />
            <ChatContainer /> 
            <ChatInput />
          </main>
        </SidebarInset>
      </Popover>
    </SidebarProvider>
  );
}
```

The sub-components rendered by `<FullChatApp>` all play important roles in the application:

- Chat Sidebar: This manages user sessions and previous conversations.
	```js
	// components/ChatSidebar.tsx
	"use client";

	export function ChatSidebar() {
		return (
			<Sidebar>
				<SidebarHeader>
					{/* App logo and search button */}
				</SidebarHeader>

				<SidebarContent>
					{/* New Chat button */}
					{/* Session list or empty state */}
				</SidebarContent>
			</Sidebar>
		);
	}
	```

- Chat Header: Holds the sidebar and agent config trigger as well as a "new chat" button.
	
	```js
	// components/ChatHeader.tsx
	export function ChatHeader() {
		return (
			<header>
				{/* Sidebar trigger and agent dropdown */}
				{/* New chat button */}
			</header>
		);
	}
	```

- Chat Input: This component takes allows the user to enter a prompt, handles submissions, and displays some prompt suggestions.
	
	```js
	// components/ChatInput
	"use client";

	export function ChatInput() {
		const [prompt, setPrompt] = useState("");

		function submitPrompt() {
			// Handle message submission
		}

		return (
			<div>
				<PromptInput value={prompt} onValueChange={setPrompt} onSubmit={submitPrompt}>
					{/* Textarea for typing messages */}
					{/* Send button */}
				</PromptInput>
			</div>
		);
	}
	```

- Chat Config: Contains input fields used to configure the agent's behavior:

```js
	// components/ChatConfig.tsx
	"use client";

	import { useState } from "react";

	export function ChatConfig() {
		const [agentMode, setAgentMode] = useState<"flash" | "fast" | "max">("flash");
		const [agentSystem, setAgentSystem] = useState("");
		const [agentRules, setAgentRules] = useState<string[]>([]);
		const [newRuleInput, setNewRuleInput] = useState("");

		function addRule() {
			// Handle adding new rule
		}

		function removeRule(index: number) {
			// Handle removing rule
		}

		return (
			<div>
				{/* Agent Configuration Header */}
				{/* Mode Selector */}
				{/* System Prompt Textarea */}
				{/* Rules Input + Add Button */}
				{/* List of Rules with Remove Button */}
			</div>
		);
	}

```


- Chat Container: Displays the messages between the user and the agent. Fow now, it contains only sample messages:

	```js
	"use client";

	export function ChatContainer() {
		const messages = [
			{ id: 1, type: "user", content: "Hey there!" },
			{ id: 2, type: "agent", content: "Hi! How can I help?" },
		];

		return (
			<div className="chat-container">
				{/* Render messages */}
				{/* Scroll-to-bottom button */}
			</div>
		);
	}
	```

### Defining Message Components

As discussed in the previous section, the Agent's API returns a series of objects. You'll define components for each of the expected event types.

This approach breaks down the message display logic, alowing `ChatContainer` to simply loop through the messages array and render the appropriate component based on the `type` of each message object.

```js
// Renders the user's submitted prompt.
export function UserMessage({ content }: { content?: string }) { /* ... */ }

// Renders a loading indicator while awaiting the agent's response.
export function LoadingMessage() { /* ... */ }

// Renders any errors that occur during the API call.
export function ErrorMessage({ errorMessage }: { errorMessage: string }) { /* ... */ }

// Renders the agent's internal "thinking" process in a collapsible view.
export function AgentThinking({ content }: { content?: string }) { /* ... */ }

// Renders the output from any tools the agent utilizes.
export function AgentToolUse({ content }: { content?: string }) { /* ... */ }

// Renders the final, user-facing response from the agent with markdown support.
export function AgentResponse({ content }: { content?: string }) { /* ... */ }

// Renders the transaction cost and remaining balance after a response.
export function AgentCost({ cost, balance }: { cost?, balance? }) { /* ... */ }

// Renders final action buttons, such as feedback.
export function AgentCompleted() { /* ... */ }
```

The main chat view is now simplified, needing only a switch statement to render the corresponding component for each message type. This modular structure will play a key role when streaming the message events.

Finally, some custom keyframes were added to the `global.css` file to help with "typing" and "fadeIn" animations for the messages, and the types for our application where declared in `lib/types.ts`.

With the code setup from the [section-2-static-ui](), run `npm run dev` in the terminal and you should see the application's basic UI interface:

![Agentbase Chat Application Preview](/tutorial/agentbase-preview.png)

## Basic Agentbase Integration

With the application's UI in place your next objective is to enable real-time streaming communication with the Agentbase API. Thanks to Agentbase `message events stream` structure, you can build this right away.

For this to work you will:

- create a secure server-side endpoint that returns a stream
- manage client-side state
- handle the streamed data flow

### Creating a Secure API Route

To protect the `AGENTBASE_API_KEY`, all interactions with the Agentbase SDK must occur on the server of your application. You'll create a Next.js API route that acts as a proxy between the client and the Agentbase service.

Create a `.env` file to store the API key obtained earlier.

```bash
AGENTBASE_API_KEY=your-api-key-here
```

Next, create a helper function to initialize and reuse a single instance of the Agentbase client. This way, all your agent routes, can reuse the same client.

```js
// lib/agentClient.ts
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
```

Now add the code for the API route to use this client, and send a message to the agent using the `agent.run` method on the agentbase client.

```js
// app/api/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentClient";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { message } = body;

		if (!message) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}

		// Initialize Agentbase client and prepare the request
		const agentbase = getAgentbaseClient();
		const params = { message };

		// Stream response chunks from the agent
		const agentStream = await agentbase.runAgent(params);

		const DELIMITER = "<<<END_OF_CHUNK>>>";
		const fullChunk: unknown[] = [];

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				try {
					// Forward each streamed chunk to the client
					for await (const chunk of agentStream) {
						const jsonChunk =
							typeof chunk === "string"
								? JSON.stringify({ message: chunk })
								: JSON.stringify(chunk);

						fullChunk.push(jsonChunk);
						controller.enqueue(
							encoder.encode(jsonChunk + DELIMITER)
						);
					}

					controller.close();
				} catch (err) {
					controller.error(err);
				}
			},
		});

		// Return the response stream
		return new Response(stream, {
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
```

The Agents API streams message events which our code passes down to the UI. A Delimiter is used to ensure each of the messages are finely passed down the stream.

### Connecting the Frontend

On the frontend, you will create a helper function to send the user's message to the backend and process the streaming response.

```js
// @/lib/api.ts
export async function fetchAgentResponse({
	message,
	onChunk,
}: SendMessageParams): Promise<SessionMessage[] | void> {
	if (!message.trim()) throw new Error("Message content cannot be empty");

	const body = { message };

	// POST request to the API route
	const response = await fetch("/api/agent", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	// Handle server and network errors
	if (!response.ok) {
		let errorMessage = `HTTP error! status: ${response.status}`;
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch {
			const text = await response.text();
			errorMessage = `Server error (${response.status}): ${text.substring(0, 100)}...`;
		}
		throw new Error(errorMessage);
	}

	const reader = response.body?.getReader();
	const decoder = new TextDecoder();
	if (!reader) throw new Error("No readable stream returned from response.");

	let buffer = "";

	// Read and decode the streaming response
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value).trim();

		// Split the stream by backend-defined delimiter
		const parts = buffer.split("<<<END_OF_CHUNK>>>");
		buffer = parts.pop() || "";

		// Parse and handle each chunk as it arrives
		for (const part of parts) {
			if (!part.trim()) continue;
			try {
				const data = JSON.parse(part);
				onChunk?.(data);
			} catch (err) {
				console.error("Failed to parse chunk:", part, err);
			}
		}
	}
}
```

With this helper function in place, you can update the `<FullChatApp/>` component to manage states annd implement a function to handle the user's submit request.

```js
import { useState } from "react";
import { fetchAgentResponse } from "@/lib/api";
import { SessionMessage } from "@/lib/types";

export function FullChatApp() {
	// State for storing chat messages, error messages, and loading status
	const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	// Handles user message submission and triggers the streaming response
	const handleSubmit = async (prompt: string) => {
		if (!prompt.trim() || isLoading) return;

		// Create and display the user’s message immediately
		const userMessage: SessionMessage = {
			type: "user_message",
			content: prompt.trim(),
		};

		setSessionMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);
		setErrorMessage("");

		try {
			// Send message to API and update state as streamed chunks arrive
			await fetchAgentResponse({
				message: userMessage.content,
				onChunk: (msg: SessionMessage) => {
					setSessionMessages((prev) => [...prev, msg]);
				},
			});
		} catch (err) {
			// Handle any request or parsing errors
			setErrorMessage(
				err instanceof Error ? err.message : "An error occurred"
			);
		} finally {
			setIsLoading(false);
		}
	};
}

```

All that's left is to pass the states and handleSubmit function as props to the `<ChatContainer/>` and `<ChatInput/>` components to bring the UI to life.

The updated `<ChatInput/>` components now triggers the submission logic when the user sends a message, and changes the state of the input field based on the `isLoading` state.

While the updated `<ChatContainer/>` component now maps over the `sessionMessages` array and, using a `switch` statement, renders the appropriate message component (`UserMessage`, `AgentResponse`, `AgentToolUse`, etc.).

### Agent Configuration

The final change to be made to the UI is
In production, agents are usually pre-configured to align their behavior with a specific usecase (e.g, a customer service bot). However, for the user-facing agent you are building, you want to give users a few customization options.

Luckily, Agentbase has configuration parameters for this purpose as well:

- Mode: Defines the agent's operational behavior. It accepts flash (for fast, simple tasks), fast (a balanced default), or max (for complex, deep reasoning).
- System: A system prompt that defines the agent's core identity, purpose, and high-level instructions.
- Rules: A set of specific constraints or guidelines the agent must follow during its execution.

You will create some new states, and a seperate component for managing these settings:

```js
// components/FullChatApp.tsx
const [agentMode, setAgentMode] = useState<AgentMode>("fast");
const [agentSystem, setAgentSystem] = useState<string>("");
const [agentRules, setAgentRules] = useState<string[]>([]);
```

Pass these to the `<ChatConfig/>` component which contains dropdowns, text areas and input fields, as well as handle the changes made to the configurations:

```js
// components/FullChatApp.tsx
<ChatConfig
  agentMode={agentMode}
  setAgentMode={setAgentMode}
  agentSystem={agentSystem}
  setAgentSystem={setAgentSystem}
  agentRules={agentRules}
  setAgentRules={setAgentRules}
/>
```

Now, update the `handleSubmit` and `fetchAgentResponse` functions to pass these new values.

```js
// components/FullChatApp.tsx
const handleSubmit: async (prompt: string) => {
  //...
    await fetchAgentResponse({
      message: userMessage.content,
      agentMode,
      agentSystem,
      agentRules,
      onChunk: (msg: SessionMessage) => { ... }
    });
  //...
}
```

The `fetchAgentResponse` helper function is updated to include these new parameters in the request body, so they are passed to the Agentbase SDK.

```js
// lib/api.ts
export async function fetchAgentResponse({
  message,
  sessionId,
  agentMode = "fast",
  agentSystem,
  agentRules, 
  onChunk,
}: SendMessageParams & { onChunk?: (msg: SessionMessage) => void }) {
  // ...
  const body = {
    message,
    ...(sessionId && { session: sessionId }),
    ...(mode: agentMode,
    ...(agentSystem && { system: agentSystem }),
    ...(agentRules && agentRules.length > 0 && { rules: agentRules }),
  };
  // ... fetch call with streaming logic
}
```


## Implementing Conversation Persistence

At this stage of the application, your users can submit a message and receive a streamed response. However, the agent treats each request as a single submission with no memory of previous messages or conversations.

### Enabling Conversational Memory

With Agentbase, conversation history and sessions are managed on our servers with a unique `session` ID. All your need to give your agent memory is include this ID in the API, Agentbase handles mapping new messages to the previous conversation with that agent.

First, create state variables for the active sessionId and a list of all your user's sessions.

```js
// compnents/FullChatApp.tsx
const [sessionId, setSessionId] = useState<string | null>(null);
const [sessionList, setSessionList] = useState<Session[]>([]);
```

Next, update the `handleSubmit` function to pass the current `sessionId` with each request. The `onChunk` callback will now also be responsible for detecting a new `sessionId` and creating the session.

```js
// components/FullChatApp.tsx
const handleSubmit = async (prompt: string) => {
  // ... (setup userMessage, setIsLoading, etc.)

  try {
    await fetchAgentResponse({
      message: userMessage.content,
      sessionId, // Pass the current session ID
      // ... (config params will be added later)
      onChunk: (msg: SessionMessage) => {
        if (
          msg.session &&
          msg.session !== sessionId &&
          msg.type == "agent_response" // Check for a specific chunk type
        ) {
          const newSessionId = msg.session;
          createNewSession(newSessionId, msg); // Helper function
        }
        setSessionMessages((prev) => [...prev, msg]);
      },
    });
  } catch (err) {
    // ... error handling
  } finally {
    setIsLoading(false);
  }
};
```

With session creation handled, you need a few more helper functions for session management:

- `createNewSession`: Adds a new session to the list of available sessions. It creates a `sessionTitle` with the first few characters of the Agent's response.

```js
// components/FullChatApp.tsx
const createNewSession = (newSessionId: string, agentResponse: SessionMessage) => {
  const sessionTitle = agentResponse?.content?.substring(0, 40) + "..." || `Session-${newSessionId}`;

  const newSession: Session = {
    id: newSessionId,
    title: sessionTitle,
    timestamp: Date.now(),
  };

  setSessionId(newSessionId); // Set the new session as active
  setSessionList((prev) => [newSession, ...prev]); // Add to the list for the sidebar
};
```

- `newConversation`: Resets all sesion-related states, allowing the user to start a fresh conversation with the agent.

```js
const newConversation = () => {
  setSessionId(null);
  setSessionMessages([]);
  setIsLoading(false);
};
```

- `switchSession`: Switches from one session to another.

```js
const switchSession = async (session: Session) => {
  if (session.id === sessionId) return;
  // Logic to fetch messages will be added next
};
```

The `<ChatSidebar/>` component handles most session-related logic, so you will pass some of these states and functions into it, and make some updates.

```js
// components/FullChatApp.tsx
<ChatSidebar
  sessionId={sessionId}
  sessionList={sessionList}
  switchSession={switchSession}
  newConversation={newConversation}
/>
```

### Implementing Session Switching

To allow users to switch between conversations, you need a way to fetch the message history forr a given session. Agentbase provides a method for this, which you will expose through a new dynamic API route.

```js
// app/api/agent/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentbase";

export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    const agentbase = getAgentbaseClient();
    const retrievedMessages = await agentbase.messages.get({ session: sessionId });

    const messages = [];
    for await (const response of retrievedMessages) {
      messages.push(response);
    }

    return NextResponse.json(messages);
  } catch (error) {
    // ... error handling
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

Then you will create a corresponding helper function in `lib/api.ts` to call this endpoint. Since the application is loading messages from previous conversations, you can go the non-streaming route to fetch the data.

```js
// lib/api.ts
export async function fetchSessionMessages(
  sessionId: string
): Promise<SessionMessage[]> {
  if (!sessionId) throw new Error("Session ID is required");
  const response = await fetch(`/api/agent/${sessionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    // ... error handling
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
```

Finally, update the `switchSession` function to call `fetchSessionMessages` and update the states with the fetched messages and id.

```js
// component/fullchatApp.tsx
const switchSession = async (session: Session) => {
  if (session.id === sessionId) return;
  try {
    const fetchedMessages = await fetchSessionMessages(session.id);
    setSessionId(session.id);
    setSessionMessages(fetchedMessages);
  } catch (error) {
    // Handle error
  }
};
```

### Client-Side Session Persistence

While Agentbase securely stores message history for each session on its servers, the  application only tracks the list of session IDs in a component state, aa simple refresh clears it all.

For a further extension of your applications persistence, you must store a list of `session` IDs. While a production application might save this list to a user's account in a database, you can implement a lightweight, client-side solution for this tutorial using the browser's `localStorage`.

Let's create two helper functions for reading and writing the sessionList to `localStorage`.

```js
// lib/localStorage.ts
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
```

Then in your `FullChatApp` component, you'll implement `useEffect` hooks to synchronize the `sessionList` state with `localStorage`.

```js
  // components/FullChatApp.tsx
  import { readSessionList, writeSessionList } from "@/lib/localStorage";

  // loads sessions from local storage on a fresh load
  useEffect(() => {
    setSessionList(readSessionList());
  }, []);

  // saves sessionList to local storage once it changes
  useEffect(() => {
    writeSessionList(sessionList);
  }, [sessionList]);
```

Now, the agent remembers previous conversations, users can seamlessly switch between sessions, and the session list persists across browser reloads.

## Conclusion

In this tutorial, you have successfully built a persistent, feature-rich AI chat application from the ground up using Next.js and Agentbase. The final application supports continuous conversations, manages multiple session histories, and allows for real-time agent configuration, demonstrating a significant step beyond a simple request-response chatbot.

You can view a live demo of the completed application and access the full source code in the official project repository.

Live Demo: [Agentbase Chat](https://www.google.com/search?q=)

Project Repository: [Agentbase Chat Repo](https://www.google.com/search?q=)

### Simplicity with Agentbase

Building this application was straightforward because of the core features provided by the Agentbase platform:

- Server-Side State and Memory: Agentbase automatically managed the entire conversation history via a simple `session` ID. This completely removed the need for us to design, build, or maintain any backend database or state management logic.
- Unified API with Event Streams: The API's event stream gave us real-time insights into the agent's internal process. This was crucial for building a transparent UI that could display the agent's thoughts and tool usage without any complex backend work from your side.
- Effortless Agent Configuration: You added powerful customization features simply by passing parameters like `system` and `rules` in the API call. This required zero changes to your backend code, demonstrating the platform's flexibility

### Next Steps:

Your journey with Agentbase is just beginning. Here are some recommended ways to go from here:

1.  Experiment with Your Application: The finished project can be the starting point to your next big project. Try complex multi-step prompts, create custom personas, and define strict behavioral rules to see how the agent adapts.
2.  Start Building with Agentbase: Sign up on Agentbase, get your own API key, and start integrating powerful agents into your projects.
3.  Explore the Documentation: New features are constantly being added to the platform. Head over to the Agentbase docs to explore advnaced features like [tool integration](https://docs.agentbase.sh/build/tools), [computer use](https://docs.agentbase.sh/build/agent-computer), [MCP](https://docs.agentbase.sh/build/model-context-protocol), and more.
4.  Join the Community: Conect with other developers, ask questions, and share your projects on the official [Agentbase Discord server](https://discord.com/invite/KFtqf7j9fs).