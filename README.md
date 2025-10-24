# Persistent AI Chat Agent with Next.js and Agentbase

[![View Tutorial](https://img.shields.io/badge/Read-Full%20Tutorial-blue)](https://your-blog-link-here.com)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://your-live-demo-link-here.com)

This repository contains the source code for the "Building a Persistent AI Chat Agent with Next.js and Agentbase" tutorial. This project demonstrates how to build a feature-rich, stateful chat application that leverages the power of Agentbase for server-side memory and agent orchestration.

![A preview of the finished chat application UI](../agentbase-final.png)

## About This Project

This is not just a simple chatbot. This application was built to showcase how to implement advanced features with minimal backend overhead using Agentbase. The full tutorial walks you through every step of the process, from making your first API call to deploying a feature-complete application.

### Core Features

* **Persistent Conversations**: The agent remembers past interactions within a session, thanks to Agentbase's server-side memory.
* **Session Management**: Users can create new chats and switch between previous conversations, which are persisted in the browser.
* **Dynamic Agent Configuration**: A UI allows users to change the agent's behavior in real-time by modifying its mode, system prompt, and rules.
* **Rich Event Rendering**: The UI is built to handle the full event stream from Agentbase, showing the agent's "thinking" process, tool usage, and costs.

---

## Read the Full Tutorial

This repository is intended to be a companion to the step-by-step blog post. For a complete explanation of the code, architecture, and the concepts behind it, please read the full tutorial:

**➡️ [Read the Full Tutorial Here](https://your-blog-link-here.com)**

---

## Following the Tutorial (Branches)

This repository is structured to follow the tutorial step-by-step. Each branch corresponds to a completed section of the article.

* [**`main`**](https://github.com/Teejay128/agentbase-chat-tutorial/tree/main) (Default): This branch contains the final, completed source code.
* [**`section-2-static-ui`**](https://github.com/Teejay128/agentbase-chat-tutorial/tree/section-2-static-ui): The **starter branch** for the tutorial. Clone this branch to follow along from the beginning.
* [**`section-3-integration`**](https://github.com/Teejay128/agentbase-chat-tutorial/tree/section-3-agentbase-integration): The completed code at the end of Section 3 (basic integration).
* [**`section-4-persistence`**](https://github.com/Teejay128/agentbase-chat-tutorial/tree/section-4-session-persistence): The completed code at the end of Section 4 (persistence).

---

## Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **AI Agent Platform**: [Agentbase](https://agentbase.sh/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) & [Prompt Kit](https://www.prompt-kit.com/)

---

## Getting Started (Running the Final Code)

To run the **final, completed project** locally, follow these steps:

1.  **Clone the repository:**
    This will clone the `main` (default) branch.

    ```bash
    git clone [https://github.com/Teejay128/agentbase-chat-tutorial.git](https://github.com/Teejay128/agentbase-chat-tutorial.git)
    cd agentbase-chat-tutorial
    ```
    *To follow the tutorial from the start, clone the `section-2-static-ui` branch instead:*
    `git clone -b section-2-static-ui https://github.com/Teejay128/agentbase-chat-tutorial.git`

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of the project and add your Agentbase Admin Token. You can get one from the [Agentbase platform](https://agentbase.sh).

    ```env
    AGENTBASE_API_KEY=sk-agb-your-admin-token-here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.