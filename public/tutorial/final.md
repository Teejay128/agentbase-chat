# How to Build an AI Agent Chat App with Agentbase

*TL;DR: This tutorial guides you through building a complete AI chat agent app with Next.js. You will learn how to interact with the Agent's API, configure your agent, implement persistent conversation histories, switch between sessions, all with the help of Agentbase.*

## Introduction to Agentbase

AI agents are a powerful evolution of reasoning models, giving them the ability to execute complex, multi-step tasks in external environments. However, developing agents introduces new challenges, such as interacting with the reasoning model, integrating tools, managing state, and parsing complex responses.

Agentbase offers a **simplified**, server-side solution that manages this entire orchestration process, exposing it all through a **unified API**. Instead of juggling these complexities, you can focus on building your application.

!["Agentbase Simplicity Diagram" illustrating how Agentbase abstracts complexity.](/tutorial/agentbase-simplicity.png)

In this tutorial, you will build a full-featured chat application from the ground up. Your app will allow users to chat with an agent that can crawl the web and perform multi-step research. You'll implement persistent conversation history, real-time message streaming, and dynamic agent configuration.

*Prerequisites: Familiarity with TypeScript and the Next.js App Router.*

We will use components from [Shadcn UI](https://ui.shadcn.com/) and [Prompt Kit](https://www.prompt-kit.com/) to assemble the interface quickly, allowing us to focus on the Agentbase integration.

## Section 1: Understanding The Agentbase Simplicity Approach

Before we build any UI, let's understand the core mechanic of Agentbase: making a request and receiving a response.

### Making Your First API Request

To interact with the Agentbase API, you'll need an API key.

Navigate to the [Agentbase Website](https://agentbase.sh) and sign up.

Create a new Admin Token and copy the generated string.

![Agentbase Page Overview" showing the dashboard and where to create a token](/tutorial/agentbase-overview.png)

*Note: Registering with a work email will grant you free credits to get started.*

With your API key, you can send a direct request using cURL.

```bash
curl --request POST \
  --url https://api.agentbase.sh/ \
  --header 'Authorization: Bearer YOUR_API_KEY_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "Hi there! Greet the user and introduce yourself."
  }'
```

*Note: For Windows Command Prompt or Powershell, the single quotes (`'`) around the JSON data may need to be replaced with double quotes (`"`), and the internal double quotes must be escaped (`\"`).*

### The Agentbase Message Event Stream

Instead of a single, slow-loading JSON response, Agentbase returns a **message event stream**. This stream gives you a real-time look into the agent's process as it happens.

Here’s an example of the data you'll receive:

```json
data: {"session":"b5sssvkfykmty8e","type":"agent_started"}
data: {"session":"b5sssvkfykmty8e","type":"agent_response","content":"Hello! I'm Base, a general-purpose AI agent developed by the Agentbase team. I'm designed to help you accomplish complex tasks by reasoning, planning, and using various tools effectively. Whether you need help with coding, research, file management, or web-related tasks, I'm here to assist you. What can I help you with today?"}
data: {"session":"b5sssvkfykmty8e","type":"agent_cost","cost":"0.0174","balance":87.53800000000007,"deductionSuccess":true,"lowBalance":false}
data: {"session":"b5sssvkfykmty8e","type":"agent_step","stepNumber":1}
data: {"session":"b5sssvkfykmty8e","type":"agent_completed"}
```

This stream allows you to see exactly how the agent processes your request:

- **agent_started**: Signals the beginning of the agent's execution.
- **agent_response**: Contains the final, user-facing message from the agent.
- **agent_cost**: Details the computational cost and remaining balance.
- **agent_completed**: Signals the end of the agent's execution.

Our entire application will be built around consuming this stream and rendering the appropriate UI for each event.

For a complete list of events, visit the [Agentbase Message Events Docs](https://docs.agentbase.sh/api/message-events).

## Section 2: Setting Up the Chat UI

Now that we understand the kind of data the Agentbase API provides, let's build the interface to display it.

To help you focus directly on the integration, this tutorial provides a [starter branch](https://github.com/Teejay128/agentbase-chat-tutorial/tree/section-2-static-ui) with the complete, static UI pre-built.

Get the starter code by cloning the `section-2-static-ui` branch:

> UPDATE POINT, WILL USE AGENTBASE REPO INSTEAD
```bash
git clone -b section-2-static-ui https://github.com/Teejay128/agentbase-chat-tutorial.git
```

This starter branch contains all the static components, scaffolded API routes, and helper files we've prepared. The rest of this section is a high-level review of these files, explaining the layout and structure of the application before we make it interactive in Section 3

### Project Setup and Dependencies

First, initialize a new Next.js application:

```bash
npx create-next-app@latest chat-agentbase --typescript --tailwind --eslint
cd chat-agentbase
```

Next, we'll install the Agentbase SDK, Shadcn/UI, and Prompt Kit.

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

For detailed installation instructions, check out the official [Shadcn/UI Installation docs](https://ui.shadcn.com/docs/installation/next) and [Prompt Kit Installation docs](https://ui.shadcn.com/docs/installation/next).

### UI Architecture Overview

The UI is structured around a few key ideas:

1. **Central State**: The main app/page.tsx renders a client component, `<FullChatApp />`. This component will manage all our application's state (the list of messages, loading status, agent configuration) and functions.

2. **Component-Driven UI**: The state is passed down to modular child components:
  - `<ChatSidebar />`: Manages the list of previous conversations (sessions).
  - `<ChatHeader />`: Holds the "New Chat" button and triggers for the sidebar and config.
  - `<ChatInput />`: A controlled component that handles user text input and the submit action.
  - `<ChatConfig />`: Contains inputs to configure the agent's behavior (mode, system prompt, rules).
  - `<ChatContainer />`: The most important UI component. It is responsible for rendering the actual list of messages.

### Mapping Events to Components

This is the most critical part of our UI. Remember the event stream from Section 1? We will create a React component for each event type.

The `<ChatContainer />` will map over the sessionMessages state array and render the correct component for each message object based on its type property.

- user_message -> `<UserMessage />`
- agent_thinking -> `<AgentThinking />`
- agent_tool_use -> `<AgentToolUse />`
- agent_response -> `<AgentResponse />`
- agent_cost -> `<AgentCost />`
- agent_completed -> `<AgentCompleted />`
- While loading -> `<LoadingMessage />`
- On error -> `<ErrorMessage />`

This modular approach makes it incredibly simple to handle the incoming event stream. When we run npm run dev, our static UI will look like this:

![Agentbase Chat Application Preview](/tutorial/agentbase-preview.png)

## Section 3: Integrating Agentbase Streaming & Configuration

With the UI shell in place, let's wire it up to the Agentbase API.

### Creating a Secure API Route

To protect our AGENTBASE_API_KEY, we must never expose it to the client. We'll create a Next.js API route that acts as a secure proxy.

First, create a .env file in your project root:

```bash
AGENTBASE_API_KEY=your-api-key-here
```

Next, create a helper to initialize the Agentbase SDK client:

```js
import { Agentbase } from "agentbase-sdk";

// Initialize a singleton client instance
let agentbase: Agentbase | null = null;

export function getAgentbaseClient(): Agentbase {
  // Reuse existing client if it exists
  if (agentbase) return agentbase;

  // Get API key from environment
  const apiKey = process.env.AGENTBASE_API_KEY;
  if (!apiKey) {
    throw new Error("AGENTBASE_API_KEY not found in environment variables");
  }

  // Create and cache the new client instance
  agentbase = new Agentbase({ apiKey });
  return agentbase;
}
```

Now, create the API route that uses this client to stream the agent's response back to our frontend:

```js
import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For this section, we only need the message.
    // We'll add session and config params in the next section.
    const { message } = body;
    // const { message, session, mode, system, rules } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get the singleton client instance
    const agentbase = getAgentbaseClient();

    // Pass only the message to the SDK
    const params = {
      message,
      // ...(session && { session }),
      // ...(mode && { mode }),
      // ...(system && { system }),
      // ...(rules && { rules }),
    };

    // Get the event stream from the agent
    const agentStream = await agentbase.runAgent(params);

    // Define a delimiter to split chunks on the client
    const DELIMITER = "<<<END_OF_CHUNK>>>";

    // Create a new ReadableStream to pipe the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Forward each chunk from the Agentbase stream
          for await (const chunk of agentStream) {
            const jsonChunk =
              typeof chunk === "string"
                ? JSON.stringify({ message: chunk })
                : JSON.stringify(chunk);

            // Enqueue the chunk followed by the delimiter
            controller.enqueue(
              encoder.encode(jsonChunk + DELIMITER)
            );
            
            // Artificial delay to better visualize streaming in the tutorial
            await new Promise((r) => setTimeout(r, 1000));
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    // Return the stream
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

This route forwards the user's message to Agentbase, receives the event stream, and pipes each chunk to our client, separated by a unique DELIMITER.

### Connecting the Frontend

On the client side, we need a function to call our new API route and process the streaming response.

```js
// Helper function to stream the agent's response
export async function fetchAgentResponse({
  message,
  // sessionId,
  // agentMode,
  // agentSystem,
  // agentRules,
  onChunk,
}: SendMessageParams): Promise<SessionMessage[] | void> {
  if (!message.trim()) throw new Error("Message content cannot be empty");

  // Pass only the message for this section
  const body = {
    message,
    // ...(sessionId && { session: sessionId }),
    // ...(agentMode && { mode: agentMode }),
    // ...(agentSystem && { system: agentSystem }),
    // ...(agentRules && agentRules.length > 0 && { rules: agentRules }),
  };

  // POST request to our backend API route
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Handle server errors
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

  // Get the reader and decoder for the stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error("No readable stream returned from response.");
  
  let buffer = "";
  
  // Read the stream
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value).trim();
    
    // Split the stream by the delimiter from the backend
    const parts = buffer.split("<<<END_OF_CHUNK>>>");
    buffer = parts.pop() || "";

    // Parse and handle each complete chunk
    for (const part of parts) {
      if (!part.trim()) continue;
      try {
        const data = JSON.parse(part);
        onChunk?.(data);
      } catch (err) {
        console.error("Failed to parse: ", part, err);
      }
    }
  }
}
```

This function fetches our API route, reads the stream, splits it by our DELIMITER, parses each JSON chunk, and calls the onChunk callback with the new message.

### Managing State and Handling Submissions

Inside `<FullChatApp />`, we'll bring the application to life with a few changes:

First, uncomment imports for `SessionMessage` and `fetchAgentResponse` at the top of the file.

Next, add states for managing session message and statuses (loading and error).

```js
  // components/FullChatApp.tsx
  // within the FullChatApp() function

	const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>(
		[]
	);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
```

Replace the empty `handleSubmit` function with the full streaming logic:

```js
  // components/FullChatApp.tsx
  // after declaring states

  const handleSubmit = async (prompt: string) => {
		if (!prompt.trim() || isLoading) return;

		const userMessage: SessionMessage = {
			type: "user_message",
			content: prompt.trim(),
		};

		setSessionMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);
		setErrorMessage("");

		if (!userMessage.content) return;

		try {
			await fetchAgentResponse({
				message: userMessage.content,
				// sessionId,
				// agentMode,
				// agentSystem,
				// agentRules,
				onChunk: (msg: SessionMessage) => {
					// checking and handling creation of new session will be implemented in section 4

					setSessionMessages((prev) => [...prev, msg]);
				},
			});
		} catch (err) {
			setErrorMessage(
				err instanceof Error ? err.message : "An error occurred"
			);
		} finally {
			setIsLoading(false);
		}
	};
```

Finally we pass down some props into the `<ChatContainer />` and `<ChatInput />` components:

```js
// components/FullChatApp.tsx
// within the returned elements

<ChatContainer
  sessionMessages={sessionMessages}
  isLoading={isLoading}
  errorMessage={errorMessage}
/>
<ChatInput
  sessionMessages={sessionMessages}
  isLoading={isLoading}
  handleSubmit={handleSubmit}
/>
```

These `<Chatcontainer />` component is then modified to render the respective messages.

```js
// component/ChatContainer.tsx
// after importing ChatMessages components

// uncommented import and interface
import { SessionMessage } from "@/lib/types";
interface ChatContainerProps {
	sessionMessages: SessionMessage[];
	isLoading: boolean;
	errorMessage: string;
}

// now receives props from parent
export function ChatContainer({
	sessionMessages,
	isLoading,
	errorMessage,
}: ChatContainerProps) {


  useEffect(() ={

  }, [sessionMessages]) // added sessionMessages to dependency array

  return (
    //...

    <ChatContainerContent className="mx-auto w-full px-2 py-6 flex flex-col space-y-3 animate-fadeIn transition-all duration-300">
    {sessionMessages.map((message, index) => {
      switch (message.type) {
        case "user_message":
          return (
            <UserMessage
              key={`user-${index}`}
              content={message.content}
            />
          );
        case "agent_thinking":
          return (
            <AgentThinking
              key={`thinking-${index}`}
              content={message.content}
            />
          );
        case "agent_tool_use":
          return (
            <AgentToolUse
              key={`tool-${index}`}
              content={message.content}
            />
          );
        case "agent_response":
          return (
            <AgentResponse
              key={`response-${index}`}
              content={message.content}
            />
          );
        case "agent_cost":
          return (
            <AgentCost
              key={`cost-${index}`}
              cost={message.cost}
              balance={message.balance}
            />
          );
        case "agent_completed":
          return (
            <AgentCompleted
              key={`completed-${index}`}
            />
          );
        default:
          return null;
      }
    })}

    {isLoading && <LoadingMessage />}
    {errorMessage && (
      <ErrorMessage errorMessage={errorMessage} />
    )}
  </ChatContainerContent>
  )

  // ...
}
```

While the `<ChatInput />` triggers the submission of the user's request to the Agent.

```js
// component/ChatInput
// After component imports

// uncommented props interface
interface ChatInputProps {
	sessionId: string | null;
	isLoading: boolean;
	handleSubmit: (prompt: string) => void;
}

// const defaultSuggestions = [...

// now receives props from parent
export function ChatInput({
	sessionMessages,
	isLoading,
	handleSubmit,
}: ChatInputProps) {
	const [prompt, setPrompt] = useState<string>("");
	const [suggestions, setSuggestions] = useState<boolean>(true);

  // useEffect to hide suggestions if there are messages
	useEffect(() => {
		if (sessionMessages?.length) {
			setSuggestions(false);
		} else {
			setSuggestions(true);
		}
	}, [sessionMessages]);

  // submitPrompt function now calls handleSubmit in parent
	function submitPrompt() {
		setSuggestions(false);
		handleSubmit(prompt);
		setPrompt("");
	}

  return (
    // suggestions...

    // add PromptInput isLoading property
    isLoading={isLoading}

    // update PromptInputAction button disabled property
    // disabled={!prompt.trim()} (previous version)
    disabled={!prompt.trim() || isLoading}

    // dynamic loading indicator for button:
    {isLoading ? (
      <Square className="size-5 fill-current" />
    ) : (
      <ArrowUp className="size-5" />
    )}
  )
}
```

### Adding Agent Configuration

Agentbase allows for easy configuration. Let's add state for the config options and pass them to our API.

First, add the config state to `<FullChatApp />`:

```js
// component/FullChatApp.tsx
// near state declarations

const [agentMode, setAgentMode] = useState<AgentMode>("fast");
const [agentSystem, setAgentSystem] = useState<string>("");
const [agentRules, setAgentRules] = useState<string[]>([]);

// ...

<ChatConfig
  agentMode={agentMode}
  setAgentMode={setAgentMode}
  agentSystem={agentSystem}
  setAgentSystem={setAgentSystem}
  agentRules={agentRules}
  setAgentRules={setAgentRules}
/>
```

We pass these states and their setters to the `<ChatConfig />` component. Then, we update our functions to pass these parameters in the request body.

*Uncomment the `agentMode`, `agentSystem`, and `agentRules` parameters in both the `handleSubmit` and `fetchAgentResponse` functions and our api route (app/api/agent/route.ts).*

Finally, in the `<ChatConfig />` component, replace the config states with the props passed down from the parent:

```js
// components/ChatConfig.tsx
// after type declarations

// uncommented props interface
interface ChatConfigProps {
  agentMode: AgentMode;
  setAgentMode: SetStateAction<AgentMode>;
  agentSystem: string;
  setAgentSystem: SetStateAction<string>;
  agentRules: string[];
  setAgentRules: SetStateAction<string[]>;
}

export function ChatConfig({
	agentMode,
	setAgentMode,
	agentSystem,
	setAgentSystem,
	agentRules,
	setAgentRules,
}: ChatConfigProps) {
  const [newRuleInput, setNewRuleInput] = useState("");

  return (
    // config component...
  )

}
```

Now, our app can stream responses directly from the API and allow users to configure the agent's behavior in real-time.

![Agentbase integration with messages and tool use](/tutorial/agentbase-integration.png)

This was a big section with a lot of new logic. If you ran into any errors or your app isn't behacing as expected, you can view the complete code for this part of the tutorial on the [section-3-agentbase-integration](https://github.com/Teejay128/agentbase-chat-tutorial/tree/section-3-agentbase-integration).

## Section 4: Implementing Conversation Persistence

Our app currently works just fine, but the agent has no memory of conversations. Agentbase manages and stores conservation history on the server with the help of a unique session ID. We'll use this id to implement persistence in our application's conversations.

### Enabling Conversational Memory

First, we need states to track the active `sessionId` and store a list of all our user's sessions.

```js
// components/FullChatApp.tsx
const [sessionId, setSessionId] = useState<string | null>(null);
const [sessionList, setSessionList] = useState<Session[]>([]);
```

Next, we update `handleSubmit` to pass the `sessionId` (if it exists) with each request. We also update the `onChunk` callback to detect the new `sessionId` returned by Agentbase on the first message of a conversation.

```js
// components/FullChatApp.tsx
// handleSubmit function

const handleSubmit = async (prompt: string) => {
  // ...

  try {
    await fetchAgentResponse({
      message: userMessage.content,
      sessionId, // uncommented sessionId
      agentMode,
      agentSystem,
      agentRules,
      onChunk: (msg: SessionMessage) => {
        // check for new session id and type is agent_response
        if (msg.session && msg.type == "agent_response") {
          // create a new session
          const newSessionId = msg.session;
          createNewSession(newSessionId, msg);
        }

        setSessionMessages((prev) => [...prev, msg]);
      },
    });
  } catch (err) {
    setErrorMessage(
      err instanceof Error ? err.message : "An error occurred"
    );
  } finally {
    setIsLoading(false);
  }
};
```

*Ensure the `fetchAgentResponse` function is also updated to work with the new `sessionId` state by uncommenting it in the `lib/api.ts` file.*

We'll also need to add other helper functions for session management:

- `newConversation`: Resets the sessionId and sessionMessages to start a fresh chat.

```js
// components/FullChatApp.tsx

// Resets all session related states (for a fresh conversation)
const newConversation = () => {
  setSessionId(null);
  setSessionMessages([]);
  setIsLoading(false);
};
```

- `createNewSession`: A function that adds the new session to our sessionList state. This is called by `handleSubmit`.

```js
// components/FullChatApp.tsx

const createNewSession = async (
  newSessionId: string,
  agentResponse: SessionMessage
) => {
  // updates the sessionId state
  setSessionId((currentSessionId) => {
    if (currentSessionId === newSessionId) return currentSessionId;

    // updates the list of sessions
    setSessionList((currentList) => {
      // avoids creating new sessions
      const exists = currentList.some((s) => s.id === newSessionId);
      if (exists) {
        return currentList;
      }
      // creates sessionTitle from agent's response
      const sessionTitle =
        `${agentResponse.content?.substring(0, 40)}...` ||
        `Session-${newSessionId}`;
      const newSession = {
        id: newSessionId,
        title: sessionTitle,
        timestamp: Date.now(),
      };

      return [newSession, ...currentList];
    });

    return newSessionId;
  });
};
```
- `switchSession`: Will allow us to load a previous conversation.

```js
// components/FullChatApp.tsx

const switchSession = async (session: Session) => {
  // Do nothing if it's already the current session
  if (session.id === sessionId) return;

  // For now, just log the ID. We'll fetch messages here later.
  console.log("Switching to session:", session.id);
};
```

These new states and functions also have to be propagated down to child components:

```js
// components/FullChatApp.tsx
// in the returned component

return (
  <SidebarProvider>
    <Popover>
      {/* states and functions for session management*/}
      <ChatSidebar
        sessionId={sessionId}
        sessionList={sessionList}
        switchSession={switchSession}
        newConversation={newConversation}
      />
      <SidebarInset>
        <ChatConfig
          agentMode={agentMode}
          setAgentMode={setAgentMode}
          agentSystem={agentSystem}
          setAgentSystem={setAgentSystem}
          agentRules={agentRules}
          setAgentRules={setAgentRules}
        />
        <main className="flex h-screen flex-col overflow-hidden">
          {/* pass newConversation to chat header */}
          <ChatHeader newConversation={newConversation} />
          <ChatContainer
            sessionMessages={sessionMessages}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
          <ChatInput
            sessionMessages={sessionMessages}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </main>
      </SidebarInset>
    </Popover>
  </SidebarProvider>
);
```

The updated `<ChatHeader />` component simply needs to take in the `newConversation` prop, which is triggered by the "message plus" button.

```js
// components/ChatHeader.tsx

// now takes in newConversation prop
export function ChatHeader({
	newConversation,
}: {
	newConversation: () => void;
}) {
  return (
    // ... (rest of the header)
    <div className="ml-auto text-sm font-medium text-muted-foreground items-center">
      {/* added onClick handler*/}
      <Button variant="ghost" onClick={newConversation}>
        <MessageSquarePlus className="h-5 w-5" />
      </Button>
    </div>
  )
}
```

While the new `<ChatSidebar />` component is updated to loop through and display the `sessionList` as well as handle the creation and switching of sessions.

```js
// components/ChatSidebar.tsx
// right after imports

// uncommented types and props interface
import { Session } from "@/lib/types";
interface ChatSidebarProps {
	sessionId: string | null;
	sessionList: Session[];
	switchSession: (session: Session) => Promise<void>;
	newConversation: () => void;
}

// takes in props from parent component
export function ChatSidebar({
	sessionId,
	sessionList,
	switchSession,
	newConversation,
}: ChatSidebarProps) {
	const [loadingSessionId, setLoadingSessionId] = useState<string | null>(
		null
	);

	// added the code for handleSwitch
	const handleSwitch = async (session: Session) => {
		if (loadingSessionId || sessionId == session.id) return;
		setLoadingSessionId(session.id);
		try {
			await switchSession(session);
		} finally {
			setLoadingSessionId(null);
		}
	};

	return (
		<Sidebar>

			<SidebarContent className="pt-4">
				<div className="px-4">
					<Button
						variant="outline"
						className="mb-4 flex w-full items-center gap-2"
						// added onClick and disabled properties
						onClick={newConversation}
						disabled={sessionId == null}
					>
						<PlusIcon className="size-4" />
						<span>New Chat</span>
					</Button>
				</div>
				{/* conditionally displays session list in sidebar menu */}
				<SidebarMenu className="px-2">
					{sessionList.length === 0 ? (
						<div className="px-2 py-1 text-sm text-muted-foreground h-full">
							No sessions yet
						</div>
					) : (
						sessionList.map((session) => (
							<SidebarMenuItem key={session.id} className="p-0">
								<SidebarMenuButton
									title={`Session ID: ${session.id}`}
									isActive={sessionId == session.id}
									// each session calls the handleSwitch function when clicked
									onClick={() => handleSwitch(session)}
								>
									<span className="text-sm font-medium">
										{session.title}
									</span>
									{loadingSessionId === session.id && (
										<Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
									)}
								</SidebarMenuButton>
							</SidebarMenuItem>
						))
					)}
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}
```

### Implementing Session Switching

Since Agentbase stores the messages for each session, all we need is to fetch the message history for a given `sessionId`. We'll create a new dynamic API route for this.

```js
// app/api/agent/[sessionId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAgentbaseClient } from "@/lib/agentClient";

// GET /api/agent/[sessionId]
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Get the session ID from the dynamic URL parameter
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    const agentbase = getAgentbaseClient();

    // Use the SDK to fetch the history for the given session
    const retrievedMessages = await agentbase.messages.get({
      session: sessionId,
    });

    // The SDK returns an async iterator; we collect all messages into an array
    const messages = [];
    for await (const response of retrievedMessages) {
      messages.push(response);
    }

    // Unlike streaming a new response, we're loading past history.
    // It's more efficient to send the entire conversation at once as a single JSON payload.
    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

This route uses the agentbase.messages.get SDK method to retrieve all messages for a session. Now, we add a corresponding fetcher in lib/api.ts:

```js
// lib/api.ts
// after fetchAgentResponse function

export async function fetchSessionMessages(
  sessionId: string
): Promise<SessionMessage[]> {
  if (!sessionId) throw new Error("Session ID is required");

  // Call the new dynamic API route to get the session history
  const response = await fetch(`/api/agent/${sessionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  // Handle any server-side errors
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

  // Parse the full array of messages from the non-streaming response
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

Finally, we update our switchSession function in `<FullChatApp />` to call this fetcher and populate our state.

```js
// components/FullChatApp.tsx
// switchSession

const switchSession = async (session: Session) => {
  if (session.id === sessionId) return;
  try {
    // fetch messages from agent's api
    const fetchedMessages = await fetchSessionMessages(session.id);

    // update session states
    setSessionId(session.id);
    setSessionMessages(fetchedMessages);
  } catch (error) {
    throw new Error("Function not implemented:" + error);
  }
};
```

### Client-Side Session Persistence

Our app now remembers conversations, but the list of sessions disappears on refresh. We can fix this by storing the sessionList in localStorage.

Create two helpers to manage this:

```js
// lib/localStorage.ts

import { Session } from "@/lib/types";

const SESSION_LIST_KEY = "chat_conversation_history";
const initialSessionList: Session[] = [];

// Reads the list of session IDs from the browser's localStorage
export const readSessionList = (): Session[] => {
  // Check if window is defined (prevents server-side errors)
  if (typeof window === "undefined") return initialSessionList;
  try {
    const storedList = localStorage.getItem(SESSION_LIST_KEY);
    return storedList ? JSON.parse(storedList) : initialSessionList;
  } catch (e) {
    console.error("Error reading session list:", e);
    return initialSessionList;
  }
};

// Writes the current session list to the browser's localStorage
export const writeSessionList = (list: Session[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Error writing session list:", e);
  }
};
```

In `<FullChatApp />`, we use two useEffect hooks to synchronize our sessionList state with localStorage.

```js
// components/FullChatApp.tsx
import { readSessionList, writeSessionList } from "@/lib/localStorage";

export default function FullChatApp() {
  // states...
  // functions...

	useEffect(() => {
		setSessionList(readSessionList());
	}, []);

	useEffect(() => {
		writeSessionList(sessionList);
	}, [sessionList]);

  // return (...)
}
```

With this, our application is feature-complete. It supports streaming, configuration, and persistent, switchable conversations.

![Agentbase Chat App Final Look with Sessions and Messages](/tutorial/agentbase-final.png)
Congratulations on building an Agentbase-powered AI chat appliacaion!

*If you got lost at any point or want to see the final, completed project, checkout out the code for this section on the [section-4-session-persistence](https://github.com/Teejay128/agentbase-chat-tutorial/tree/section-4-session-persistence) branch.*

## Conclusion

In this tutorial, you successfully built a feature-rich AI chat application using Next.js and Agentbase. You implemented **persistent multi-session** history, **real-time event** streaming, and dynamic **agent configuration**, going far beyond a simple request-response bot.

You can view a live demo and access the full source code below.

Live Demo: [Live Demo of Agentbase Chat App](http://agentbase-chat.vercel.app/)

Project Repository: [Full GitHub Repo for Agentbase Chat App](https://github.com/Teejay128/agentbase-chat-tutorial)

### The Simplicity of Agentbase

Building this application was streamlined thanks to the core features of the Agentbase platform:

- **Server-Side State and Memory**: Agentbase managed the entire conversation history via a simple session ID, removing the need for us to build or maintain a complex backend database.

- **Unified API with Event Streams**: The event stream provided crucial, real-time insights into the agent's process, allowing us to build a transparent UI without any complex backend work.

- **Effortless Agent Configuration**: We added powerful customization by simply passing parameters in the API call, requiring zero changes to our backend logic.

### Next Steps

Your journey with Agentbase is just beginning. Here are some recommended ways to go from here:

1. Experiment with Your App: Try complex, multi-step prompts. Create custom personas with the system prompt and define
strict behavioral rules to see how the agent adapts.

2. Explore the Documentation: Head to the [Agentbase Docs](https://docs.agentbase.sh/) to discover advanced features like [tool integration](https://docs.agentbase.sh/build/tools), [computer use](https://docs.agentbase.sh/build/agent-computer), [MCP](https://docs.agentbase.sh/build/model-context-protocol), and more.

3. Join the Community: Connect with other developers, ask questions, and share your version of the Agentbase Chat App in the official [Agentbase Discord server](https://discord.com/invite/KFtqf7j9fs).