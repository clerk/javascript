<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_agent_toolkit" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/agent-toolkit</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_agent_toolkit)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/agent-toolkit/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get Help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_agent_toolkit)

</div>

> [!IMPORTANT]
>
> Agent behavior is typically non-deterministic. Ensure you thoroughly test your integration and evaluate your application's performance. Additionally, consider scoping this toolkit's tools to specific users to limit resource access.
>
> If your app's code path is predetermined, it's always preferable to call APIs directly instead of using agents and tool calling.
>
> This SDK is recommended for testing purposes only unless you are confident in the agent's behavior and have implemented necessary security measures such as guardrails and best practices.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Public APIs](#public-apis)
3. [Use with Vercel's AI SDK](#use-with-vercels-ai-sdk)
4. [Use with Langchain](#use-with-langchain)
5. [Advanced Usage](#advanced-usage)
6. [Support](#support)

## Getting Started

Use this SDK to integrate [Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_agent_toolkit) into your agentic workflows. The Clerk Agent Toolkit enables popular agent frameworks, including Vercel's AI SDK and LangChain, to integrate with Clerk using tools (also known as function calling).

This package exposes a subset of Clerk's functionality to agent frameworks, allowing you to build powerful agentic systems capable of managing users, user data, organizations, and more.

## Public APIs

The Clerk Agent Toolkit package provides two main import paths:

- `@clerk/agent-toolkit/ai-sdk`: Helpers for integrating with Vercel's AI SDK.
- `@clerk/agent-toolkit/langchain`: Helpers for integrating with Langchain.

The toolkit offers the same tools and core APIs across frameworks, but their public interfaces may vary slightly to align with each framework's design:

- `createClerkToolkit(options)`: Instantiates a new Clerk toolkit.
- `toolkit.injectSessionClaims(systemPrompt)`: Injects session claims (`userId`, `sessionId`, `orgId`, etc.) into the system prompt, making them accessible to the AI model.
- `toolkit.users()`: Provides tools for managing users.
- `toolkit.organizations()`: Provides tools for managing organizations.
- `toolkit.allTools()`: Returns all available tools.
- `toolkit.toolMap()`: **(Langchain only)** Returns an object mapping available tools, useful for calling tools by name.

For more details on each tool, refer to the framework-specific directories or the [Clerk Backend API documentation](https://clerk.com/docs/reference/backend-api).

### Prerequisites

- `ai-sdk`: `"^3.4.7 || ^4.0.0"`, or `langchain`: `"^0.3.6"`
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_agent_toolkit).
- An API key for an AI model compatible with Langchain

### Example Repository

- [Clerk AI SDK Example](https://github.com/clerk/agent-toolkit-example)

## Use with Vercel's AI SDK

1. Install the Clerk Agent Toolkit package:

   ```shell
   npm install @clerk/agent-toolkit
   ```

2. Set the Clerk secret key as an environment variable in your project. Ensure you also configure any required LLM model keys.

   ```
   CLERK_SECRET_KEY=sk_
   ```

3. Import the helper from the `/ai-sdk` path, instantiate a new Clerk `toolkit`, and use it in your agent function:

```typescript
// Import the helper from the ai-sdk path
import { createClerkToolkit } from '@clerk/agent-toolkit/ai-sdk';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { systemPrompt } from '@/lib/ai/prompts';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  // Optional - get the userId from the request
  const { userId } = await auth.protect();

  // Instantiate a new Clerk toolkit
  // Optional - scope the toolkit to a specific user
  const toolkit = await createClerkToolkit({ context: { userId } });

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    // Optional - inject session claims into the system prompt
    system: toolkit.injectSessionClaims(systemPrompt),
    tools: {
      // Provide the tools you want to use
      ...toolkit.users(),
      ...toolkit.organizations(),
    },
  });

  return result.toDataStreamResponse();
}
```

## Use with Langchain

1. Install the Clerk Agent Toolkit package:

   ```shell
   npm install @clerk/agent-toolkit
   ```

2. Set the Clerk secret key as an environment variable:

   ```shell
   CLERK_SECRET_KEY=sk_
   ```

3. Import the helper from the `/langchain` path, instantiate a new Clerk `toolkit`, and use it in your agent function:

```typescript
// Import the helper from the langchain path
import { createClerkToolkit } from '@clerk/agent-toolkit/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { auth } from '@clerk/nextjs/server';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LangChainAdapter } from 'ai';
import { systemPrompt } from '@/lib/ai/prompts';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { userId } = await auth.protect();

  // Instantiate a new Clerk toolkit
  // Optional - scope the toolkit to a specific user
  const toolkit = await createClerkToolkit({ context: { userId } });

  const model = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 });

  // Bind the tools you want to use to the model
  const modelWithTools = model.bindTools(toolkit.users());

  const messages = [new SystemMessage(toolkit.injectSessionClaims(systemPrompt)), new HumanMessage(prompt)];
  const aiMessage = await modelWithTools.invoke(messages);
  messages.push(aiMessage);

  for (const toolCall of aiMessage.tool_calls || []) {
    // Call the selected tool
    const selectedTool = toolkit.toolMap()[toolCall.name];
    const toolMessage = await selectedTool.invoke(toolCall);
    messages.push(toolMessage);
  }

  // To simplify the setup, this example uses the ai-sdk langchain adapter
  // to stream the results back to the /langchain page.
  // For more details, see: https://sdk.vercel.ai/providers/adapters/langchain
  const stream = await modelWithTools.stream(messages);
  return LangChainAdapter.toDataStreamResponse(stream);
}
```

## Advanced Usage

### Using a Custom `clerkClient`

If you need to set the Clerk secret key dynamically or use different Clerk instances, pass a custom `clerkClient`. Install `@clerk/backend` into your project and call the `createClerkClient` function:

```typescript
import { createClerkToolkit } from '@clerk/agent-toolkit/ai-sdk';
import { createClerkClient } from '@clerk/backend';

export async function POST(req: Request) {
  // Create a new Clerk client
  const clerkClient = createClerkClient({ secretKey: 'sk_' });

  // Instantiate a new Clerk toolkit with the custom client
  const toolkit = await createClerkToolkit({ clerkClient });

  // Use the toolkit as usual
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: toolkit.users(),
  });
}
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_agent_toolkit)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/agent-toolkit/LICENSE) for more information.
