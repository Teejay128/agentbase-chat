# How To Build An AI Agent Chat App with Agentbase

## Introduction to Agentbase

AI agents extend the capabilities of reasoning models, enabling them to carry out complex, multi step tasks in external environments. The process of building such agents requires developers to handle numerous complexities such as:

- Interacting with the reasoning model
- Integrating tools and services
- Managing memory and internal state
- Framework for parsing responses

The Agentbase platform introduces a **simplified** approach to abstract away these complexities.

Agentbase provides a server-side solution for managing the entire agent orchestration process, granting access to this service with a simple API call.

![Agentbase simplication diagram](./agentbase-simplicity.png)

In this tutorial, we will create an application that allows users to interact with an agent using Next.js and the Agentbase platform. The application will feature persistent conversation history, handle real-time message events, and allow for dynamic agent configuration.

> Prequisites: Familiarity with Typescript and the Next.js App Router is expected. The user interface will be built using components from the [Shadcn](https://ui.shadcn.com/) and [Prompt Kit](https://www.prompt-kit.com/) libraries to focus solely on the Agentbase implementation.

### Executing an Initial API Request

To interact with the Agents API provided by Agentbase, you will need an API key.

1. Navigate to the [Agentbase website](https://agentbase.sh) and click on `Sign up`.
2. Generate a new API key and keep the generated string somewhere safe.
3. Top off credits and select your preferred method of interacting with the API (we will use the Typescript-sdk in this tutorial).

![API key creation and Agentbase setup](/agentbase-overview.png)

> Register with a work email to get free credits.

With the generated API key, we can send a request to the agent using a simple command. This goes to show how directly accessible the Agents API is; requests can still be made without writing any code.

```bash
curl --request POST \
  --url https://api.agentbase.sh/ \
  --header 'Authorization: Bearer sk-agb-cac7b586a85d7a9fe62d5a055c4cfe61afb647465e8baa7102affb19f6cf8df1' \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "Hi there! Greet the user and introduce yourself."
  }'
```

> Note: For Windows Command Prompt or Powershell, the single quotes (`'`) around the JSON data may need to be replaced with double quotes (`"`), and the internal double quotes must be escaped (`\"`).

### Understanding the Message Event Stream
Upon sending the request, the API responds with a **message event stream**. This is a series of data objects that represent the full lifecycle of the agent's internal operations.

```bash
data: {"session":"b5sssvkfykmty8e","type":"agent_started"}
data: {"session":"b5sssvkfykmty8e","type":"agent_response","content":"Hello! I'm Base, a general-purpose AI agent developed by the Agentbase team. I'm designed to help you accomplish complex tasks by reasoning, planning, and using various tools effectively. Whether you need help with coding, research, file management, or web-related tasks, I'm here to assist you. What can I help you with today?"}
data: {"session":"b5sssvkfykmty8e","type":"agent_cost","cost":"0.0174","balance":87.53800000000007,"deductionSuccess":true,"lowBalance":false}
data: {"session":"b5sssvkfykmty8e","type":"agent_step","stepNumber":1}
data: {"session":"b5sssvkfykmty8e","type":"agent_completed"}
```

Each object gives details on the agent's current process, for example:

- `agent_started`: Signals the beginning of the agent's execution.
- `agent_response`: Contains the final, user-facing message from the agent.
- `agent_cost`: Details the computational cost of the request and the remaining account balance.
- `agent_completed`: Signals the end of the agent's execution for that request.

Our application will be built around this structured event stream, allowing the UI to display each stage of the agent's process.

> The full reference of object types can be found in the [Agentbase docs](https://docs.agentbase.sh/api/message-events).

## Scaffolding the Application User Interface
Now that we understand how the Agentbase API works, we can begin constructing the frontend for our application.

> If you would like to skip this process and go directly into adding Agentbase, clone this repo with the project already setup and the basic UI assembled.

### Project Setup and Dependency Installation
First, Initialize a new Next.js application using the `create-next-app` command.

```bash
npx create-next-app@latest chat-agentbase --typescript --tailwind --eslint
cd chat-agentbase
```

Next, install the necessary libraries for this application:

1. Agentbase SDK: Allows us to call methods that make requests to Agentbase API.
2. Shadcn/UI: Provides foundation components for building the user interface.
3. Prompt Kit: An extension of Shadcn/UI with components specifically designed for AI applications.

```bash
# Install the core SDK
npm install agentbase-sdk

# Initialize Shadcn/UI in your project (follow the CLI prompts)
npx shadcn-ui@latest init

# Install required Shadcn/UI components
npx shadcn-ui@latest add avatar badge button collapsible input label popover scroll-button select separator skeleton sidebar textarea tooltip

# Install required Prompt Kit components
npx shadcn-ui@latest add "https://www.prompt-kit.com/c/chat-container.json" "https://www.prompt-kit.com/c/code-block.json" "https://www.prompt-kit.com/c/loader.json" "https://www.prompt-kit.com/c/markdown.json" "https://www.prompt-kit.com/c/message.json" "https://www.prompt-kit.com/c/prompt-input.json" "https://www.prompt-kit.com/c/prompt-suggestion.json" "https://www.prompt-kit.com/c/reasoning.json" "https://www.prompt-kit.com/c/tool.json"
```

> Check out the respective docs for installation instructions for [Shadcn/UI](https://ui.shadcn.com/docs/installation/next) and [Prompt Kit](https://ui.shadcn.com/docs/installation/next)

### Assembling the Static UI
The application's UI comprises several components orchestrated by a primary client component, `<FullChatApp />`.

First, update the main entry point of the application render this central component.

```js
// app/page.tsx
import { FullChatApp } from "@/components/FullChatApp";

export default function Home() {
  return <FullChatApp />;
}
```

The `<FullChatApp />` component organizes UI elements, including the sidebar, header, content area and input form. At this stage it contains no state or logic.

```js
// components/FullChatApp.tsx
"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Popover } from "@/components/ui/popover";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatContent } from "@/components/ChatContent"; // Note: This component might be refactored into ChatContainer directly
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
            <ChatContent /> 
            <ChatInput />
          </main>
        </SidebarInset>
      </Popover>
    </SidebarProvider>
  );
}
```

### Chat Sub Components
The sub components within `<FullChatApp>` each play specific parts in the application:

- Chat Sidebar: This manages user sessions and conversations.
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

- Chat Header: Holds the sidebar and agent config popover trigger as well as a new chat button.
	
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

- Chat Input: This component holds the input field that handles submission of user messages.
	
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

- Chat Container: Displays the messages between the user and the agent. Fow now, we populate it with sample messages:

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

Get the full code the components above from this [Github Repo]()

### Defining Message Components
As discussed earlier, the Agent's API returns a series of message events. Let's define a set of components for displaying specifc event types.

This approach breaks down the message display logic, allowing the `ChatContainer` to simply iterate through the messages array and render the appropriate component based on the `type` of each message object.

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

This modular structure simplifies the main chat view. Since the rendering logic is now encapsulated within each message component, the `ChatContainer` only needs to use a `switch` statement to render the corresponding component for each message type.

## Basic Agentbase Integration
With the application's UI in place, our next objective is to enable communication with the Agentbase API.

For this, we'll create a server-side enpoint, management some states on the client side, and pass the flow of data to bring the application to life.

### Creating a Secure API Route

To protect the `AGENTBASE_API_KEY`, all interactions with the Agentbase SDK must occur on the server of our application. We will have a Next.js API route that acts as a proxy between our client application and the Agentbase service.

Create a `.env` file to store the admin token obtained earlier.

```bash
AGENTBASE_API_KEY=sk-agb-ca....19f6cf8df1
```

Next, create a helper function to initialize and reuse a single instance of the Agentbase client.

```js
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

Now, add the code for the API route. This endpoint will receive the user's message from the client, call the `runAgent` method using the secure client, and stream the complete event array back to the frontend.

```js
import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentbase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const agentbase = getAgentbaseClient();
    const agentStream = await agentbase.runAgent({
      message,
      streaming: false, // For this basic implementation, we await the full response
    });

    const responses = [];
    for await (const response of agentStream) {
      responses.push(response);
    }

    return NextResponse.json(responses);
  } catch (error) {
    // ... error handling
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Defining Application Data Structures
To ensure type safety and predictability, let's define Typescript interfaces for data used in the application.

The `SessionMessage` interface here represents the expected structure of the event objects returned by the Agents API.

```js
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

// Other interfaces like `Session` and `SendMessageParams` will also be defined here.
```

>	> View the full code here: [`types.ts`]()

### Connecting the Frontend
The `<FullChatApp />` component manages the connection between the UI and the API route. For this, it needs three key things:

- States for messages and statuses like error and loading.

	```js
	// components/FullChatApp.tsx
	"use client";

	import { useState } from "react";
	import { SessionMessage } from "@/lib/types";
	import { fetchAgentResponse } from "@/lib/api";

	// ...

	export function FullChatApp() {
		const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
		const [errorMessage, setErrorMessage] = useState<string>("");
		const [isLoading, setIsLoading] = useState(false);

		// ... rest of the component
	}
	```

- An helper function that calls the API directly and retrieves the agent response.

	```js
	// lib/agentbase.ts
	export async function fetchAgentResponse({
		message
	}: SendMessageParams): Promise<SessionMessage[]> {
		if (!message.trim()) throw new Error("Message content cannot be empty");

		const body = {
			message
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
	```

- A function that orchestrates the entire process of adding the user message, set the loading status, getting the response from the agent, and update the message state with the agent's full response upon completion, or an error message upon failure.

	```js
	// components/FullChatApp.tsx
	const handleSubmit = async (prompt: string) => {
		if (!prompt.trim() || isLoading) return;

		const userMessage: SessionMessage = {
			type: "user_message", // A client-side type for rendering
			content: prompt.trim(),
		};

		setSessionMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);
		setErrorMessage("");

		try {
			const agentResponse = await fetchAgentResponse({ message: userMessage.content! });
			setSessionMessages((prev) => [...prev, ...agentResponse]);
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : "An unknown error occurred");
		} finally {
			setIsLoading(false);
		}
	};
	```

### Bringing the UI to Life

Finally, pass the states and `handleSubmit` function as props to the child components.

```js
// components/FullChatApp.tsx
<ChatContainer
	sessionMessages={sessionMessages}
	isLoading={isLoading}
	errorMessage={errorMessage}
/>
<ChatInput
	isLoading={isLoading}
	handleSubmit={handleSubmit}
/>
```

> View the full code here [FullChatApp.tsx]()

The updated `<ChatInput/>` components now triggers the submission logic when the user sends a message, and changes the state of the input field based on the `isLoading` state.

> View the full code here [ChatInput.tsx]()

While the updated `<ChatContainer/>` component now maps over the `sessionMessages` array and, using a `switch` statement, render the appropriate message component (`UserMessage`, `AgentResponse`, `AgentToolUse`, etc.) for each object in the array.
	
> As usual, the full code changes, including the props drilling and updated rendering loop are highlighted here: [Updated ChatContainer.tsx]()

At this stage, the application is fully interactive. Users can submit a message, see a loading indicator, and receive a comprehensive response from the AI agent.

However, each submission is a standalone event, because the agent currently has no memory of the previous conversation. This will be addressed in the next section.

> Visit this link for a full reference of all the changes made in this section: [Agentbase Integration]()

## Implementing Conversation Persistence
The applicatin currently treats each user prompt as an isolated interaction. To build a true agent, we must introduce conversational memory.

### Enabling Conversational Memory
Agentbase manages conversation history and all previous messages on its serves, allowing access to them with a unique `session` ID. To give our agent memory, we simply need to include this session ID in our API calls. Agentbase handles the rest.

First, we introduce two new state variables in the `<FullChatApp />` component to manage the active session ID and the list of all conversation sessions.

```js
// compnents/FullChatApp.tsx
const [sessionId, setSessionId] = useState<string | null>(null);
const [sessionList, setSessionList] = useState<Session[]>([]);
```

Next, we update the `handleSubmit` function to pass the current `sessionId` with each request. If the `sessionId` is `null` (indicating a new conversation), Agentbase will automatically generate a new one and return it with the response. Our function then captures this new ID to create and track the new session.

```js
// components/FullChatApp.tsx
const handleSubmit = async (prompt: string) => {
  // ... (setup userMessage, setIsLoading, etc.)

  try {
    const agentResponse = await fetchAgentResponse({
      message: userMessage.content!,
      sessionId, // Pass the current session ID
    });

    // Check if a new session was created by the API
    const newSessionId = agentResponse[0]?.session;
    if (newSessionId && newSessionId !== sessionId) {
      createNewSession(newSessionId, agentResponse); // Helper function to manage session list
    }

    setSessionMessages((prev) => [...prev, ...agentResponse]);
  } catch (err) {
    // ... error handling
  } finally {
    setIsLoading(false);
  }
};
```

We also create three more helper functions for session management:

- `createNewSession`: Adds a new session to the list of available sessions. It creates a `sessionTitle` with the first few characters of the Agent's response.

	```js
	// components/FullChatApp.tsx
	const createNewSession = (newSessionId: string, agentResponse: SessionMessage[]) => {
		const agentReply = agentResponse.find((item) => item.type === "agent_response");
		const sessionTitle = agentReply?.content?.substring(0, 40) + "..." || `Session-${newSessionId}`;

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

- `switchSession`: Switches from one session to another, for now, it only checks the given `sessionId` against the current `session` ID before logging the value to the console.

	```js
	const switchSession = async (session: Session) => {
		if (session.id === sessionId) return;
		console.log(session.id)
	};
	```

> View the full code and changes here: [FullChatapp.tsx]()

These states and functions are then propagated to the `<ChatSidebar/>` component. It is then updated to display the list of sessions and handle the creation of new conversations.

```js
// components/FullChatApp.tsx
<ChatSidebar
	sessionId={sessionId}
	sessionList={sessionList}
	switchSession={switchSession}
	newConversation={newConversation}
/>
```

> View the full code changes to the sidebar component here: [ChatSidebar.tsx]()

### Implementing Session Switching
An additional piece of persistence is allowing users to click a session in the sidebar and load the messages in it's conversation history.

Agentbase provides a method to fetch all the messages for a given session ID, so we need an API endpoint for this interaction.

Create a dynamic API route that uses the `agentbase.messages.get` SDK method.

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

Next, we create a helper function to call the GET dynamic endpont and get messages for a particular session from the API.

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
```

Finally, update the `switchSession` function in `<FullChatApp>. The function now gets the messages for the selected session and updates the application state with the fetched messages and id.

> View the full list of changes made in this section here: [Conversation Persistence]()

With these implementations, the application now remembers conversations and allows users to seamlessly retrieve and continue past conversations.

## Extra Features and Customization

With the core functionality of our persistent chat application complete, this final section focuses on adding additional features that enhance the user experience and showcase other capabilities of the Agentbase platform.

### Agent Configuration

In a production environment, an agent's behaviour is usually pre-configured behind the scenes to align with a specific use case (e.g a customer service bot).

However, to demonstrate the flexibility of Agentbase, we will implement a client-side interface that lets users configure the agent's behavior in real-time.

Agentbase provides a few configuration parameters for this purpose:

- Mode: Defines the agent's operational behavior. It accepts flash (for fast, simple tasks), fast (a balanced default), or max (for complex, deep reasoning).
- System: A system prompt that defines the agent's core identity, purpose, and high-level instructions.
- Rules: A set of specific constraints or guidelines the agent must follow during its execution.

To manage these settings, we introduce new state variables in our `<FullChatApp />` component.

```js
// components/FullChatApp.tsx
const [agentMode, setAgentMode] = useState<AgentMode>("fast");
const [agentSystem, setAgentSystem] = useState<string>("");
const [agentRules, setAgentRules] = useState<string[]>([]);

//...

const handleSubmit: async (prompt: string) => {
	//...
		const agentResponse = await fetchAgentResponse({
			message: userMessage.content,
			sessionId,
			agentMode,
			agentSystem,
			agentRules,
		});
	//...
}

/// ...
<ChatConfig
	agentMode={agentMode}
	setAgentMode={setAgentMode}
	agentSystem={agentSystem}
	setAgentSystem={setAgentSystem}
	agentRules={agentRules}
	setAgentRules={setAgentRules}
/>
```

The `<ChatConfig />` component contains a `popover` with UI elements (select dropdowns, text areas, and input fields), and handles modifications made to the agent's configuration.

> View the full code file here: [ChatConfig.tsx]()

The final step is to pass these configuration values in our API call. The `fetchAgentResponse` helper function is updated to include these new parameters in the request body, which are then forwarded by our API route to the Agentbase SDK.

```js
// lib/api.ts
export async function fetchAgentResponse({
  message,
  sessionId,
  agentMode = "fast",
  agentSystem,
  agentRules, 
}: SendMessageParams): Promise<SessionMessage[]> {
  // ...
  const body = {
    message,
    ...(sessionId && { session: sessionId }),
		mode: agentMode,
    ...(agentSystem && { system: agentSystem }),
    ...(agentRules && agentRules.length > 0 && { rules: agentRules }),
  };
  // ... fetch call
}
```

### Implementing Client-Side Session Persistence
While Agentbase securely stores message history for each session on its servers, our application only tracks the list of session IDs in a component state, aa simple refresh clears it all.

For a further extension of our applications persistence, we must store a list of session identifiers. While a production application might save this list to a user's account in a database, we can implement a lightweight, client-side solution for this tutorial using the browser's `localStorage`.

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

Then in our `FullChatApp` component, we implement `useEffect` hooks to synchronize the `sessionList` state with `localStorage`.

```js
	// components/FullChatApp.tsx

	// loads sessions from local storage on a fresh load
	useEffect(() => {
		setSessionList(readSessionList());
	}, []);

	// saves sessionList to local storage once it changes
	useEffect(() => {
		writeSessionList(sessionList);
	}, [sessionList]);
```

### Guiding Users with Prompt Suggestions
To improve the onboarding experience and showcase the agent's capabilities, we can display a list of suggested prompts. These suggestions should highlight tasks where Agentbase excels, such as multi-step planning, web research, and code generation.

These suggestions will only be displayed when a user starts a new conversation (i.e., when there is no active `sessionId`).

In the `<ChatInput />` component, we define a list of default suggestions and use a `useEffect` hook to control their visibility based on the `sessionId` prop.

> The code and changes for this section can be viewed here: [Extra Features]()

This completes the feature set of our application making it not only functional and persistent, but also configurable and user-friendly.

## Conclusion
In this tutorial, we have successfully built a persistent, feature-rich AI chat application from the ground up using Next.js and Agentbase. The final application supports continuous conversations, manages multiple session histories, and allows for real-time agent configuration, demonstrating a significant step beyond a simple request-response chatbot.

You can view a live demo of the completed application and access the full source code in the official project repository.

Live Demo: [Agentbase Chat]()

Project Repository: [Agentbase Chat Repo]()

### Simplicity with Agentbase
Building this application was straightforward because of the core features provided by the Agentbase platform:

- Server-Side State and Memory: Agentbase automatically managed the entire conversation history via a simple `session` ID. This completely removed the need for us to design, build, or maintain any backend database or state management logic.

- Unified API with Event Streams: The API's event stream gave us real-time insights into the agent's internal process. This was crucial for building a transparent UI that could display the agent's thoughts and tool usage without any complex backend work from our side.

- Effortless Agent Configuration: We added powerful customization features simply by passing parameters like `system` and `rules` in the API call. This required zero changes to our backend code, demonstrating the platform's flexibility

### Next Steps:
Your journey with Agentbase is just beginning. Here are some recommended ways to go from here:

1. Experiment with Your Application: The finished project can be the starting point to your next big project. Try complex multi-step prompts, create custom personas, and define strict behavioral rules to see how the agent adapts. 
2. Start Building with Agentbase: Sign up on Agentbase, get your own API key, and start integrating powerful agents into your projects.
3. Explore the Documentation: New features are constantly being added to the platform. Head over to the [Agentbase docs]() to explore advnaced features like [tool integration](), [streaming](), [data stores](), [MCP]() and more. 
4. Join the Community: Conect with other developers, ask questions, and share your projects on the official [Agentbase Discord server]().