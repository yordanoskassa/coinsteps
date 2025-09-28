# Welcome

> Your starting point for building with the AgentMail API.

<Tip title="Welcome to AgentMail!" icon="fa-solid fa-star">
  We're excited to have you onboard!
</Tip>

AgentMail is an API platform for giving AI agents their own inboxes to send, receive, and act upon emails. This allows agents to assume their own identity and communicate via the universal protocol of email with services, people, and other agents.

## Get Started

<CardGroup>
  <Card title="Introduction" icon="fa-solid fa-rocket" href="/introduction">
    Learn about the core concepts and what makes AgentMail unique.
  </Card>

  <Card title="Quickstart" icon="fa-solid fa-book" href="/quickstart">
    Create your first inbox and send an email in minutes.
  </Card>

  <Card title="API Reference" icon="fa-solid fa-code" href="/api-reference">
    Explore the full API with interactive examples.
  </Card>
</CardGroup>

## Need Help?

<CardGroup>
  <Card title="Join our Discord" icon="fa-brands fa-discord" href="https://discord.gg/hTYatWYWBc">
    Ask questions and share your projects with the community.
  </Card>

  <Card title="Email Support" icon="fa-solid fa-envelope" href="mailto:support@agentmail.cc">
    Get in touch with our team for personalized help.
  </Card>
</CardGroup>


# Introduction

> Give AI agents email inboxes

## What is AgentMail?

AgentMail is an API platform for giving AI agents their own inboxes to send, receive, and act upon emails. We handle the infrastructure so can focus on building email agents.

**Email agents** can:

* Have conversations with users in their inboxes
* Automate email-based workflows for enterprises
* Authenticate with third party applications
* Act as first-class users on the internet

## The Problem with Traditional Email

Exisiting email infrastructure was built for humans. Legacy providers such as Gmail and Outlook have several limitations for agentic use cases:

<CardGroup>
  <Card title="No API for Inboxes" icon="fa-solid fa-link-slash">
    Legacy providers lack API support for creating new inboxes on-demand.
  </Card>

  <Card title="Per-Inbox Pricing" icon="fa-solid fa-dollar-sign">
    They charge monthly subscriptions per inbox(\$12/inbox/month !!), which is
    costly for agents.
  </Card>

  <Card title="Restrictive Limits" icon="fa-solid fa-ban">
    They impose restrictive rate and sending limits not suitable for automation.
  </Card>

  <Card title="Poor DX" icon="fa-solid fa-face-frown">
    Overall, they offer a poor developer experience for building on top of
    email. The Gmail API sucks!
  </Card>
</CardGroup>

## The Solution

AgentMail is an API-first email provider that is designed for agents. Think of it like Gmail, but with:

<Steps>
  <Step title="API-First Infrastructure">
    <Callout icon="fa-solid fa-laptop-code">
      **Programmatic Inboxes**: Create and manage inboxes via API.
    </Callout>

    <Callout icon="fa-solid fa-money-bill-wave">
      **Usage-Based Pricing**: Pay only for what you use.
    </Callout>

    <Callout icon="fa-solid fa-unlock">
      **High-Volume Ready**: No restrictive rate or sending limits.
    </Callout>

    <Callout icon="fa-solid fa-bolt">
      **Real-Time Events**: Get notified instantly with webhooks and websockets.
    </Callout>

    <Callout icon="fa-solid fa-key">
      **Simple Authentication**: Use API keys, no complex OAuth flows.
    </Callout>
  </Step>

  <Step title="AI-Native Features">
    <Callout icon="fa-solid fa-shield-halved">
      **Built-in Security**: Use API permissions and agent guardrails to control
      access.
    </Callout>

    <Callout icon="fa-solid fa-magnifying-glass">
      **Semantic Search**: Search across all inboxes in your organization by
      meaning.
    </Callout>

    <Callout icon="fa-solid fa-tags">
      **Automatic Labeling**: Automatically categorize emails with user-defined
      prompts.
    </Callout>

    <Callout icon="fa-solid fa-file-invoice">
      **Structured Data Extraction**: Pull structured data from unstructured
      emails.
    </Callout>

    <Callout icon="fa-solid fa-ellipsis-h">
      And more on the way...
    </Callout>
  </Step>
</Steps>

Our customers use AgentMail for agent identity, authentication, and communication. To get started reach out to [contact@agentmail.cc](mailto:contact@agentmail.cc) for API keys and [support@agentmail.cc](mailto:support@agentmail.cc) for help.

<iframe width="560" height="315" src="https://www.youtube.com/embed/1V7BISeFUTM?si=4asiGnuV4O81nu5B" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

## Get Started

<CardGroup>
  <Card title="Quickstart" icon="fa-solid fa-book" href="/quickstart" />

  <Card title="API Reference" icon="fa-solid fa-code" href="/api-reference" />
</CardGroup>

## Support

<CardGroup>
  <Card title="Discord" icon="brands discord" href="https://discord.gg/hTYatWYWBc" />

  <Card title="Email" icon="fa-solid fa-envelope" href="mailto:support@agentmail.cc" />
</CardGroup>


# Quickstart

> Follow this guide to make your first AgentMail API request and create a new email inbox.

This guide will walk you through installing the AgentMail SDK, authenticating with your API key, and creating your first email inbox.

<Steps>
  <Step title="Get your API Key">
    First, you'll need an AgentMail API key. You can sign up at the link below.

    <Card title="Get an API Key" icon="fa-solid fa-key" href="https://agentmail.to/pricing" target="_blank" />

    Once you have your key, create a `.env` file in your project's root
    directory and add your key to it. We recommend using environment variables to
    keep your keys secure.

    ```.env
    AGENTMAIL_API_KEY="YOUR_API_KEY"
    ```
  </Step>

  <Step title="Install the SDK">
    Install the AgentMail SDK using your preferred package manager. We'll also
    use a library to load the environment variable from the `.env` file.

    <CodeBlocks>
      ```bash title="Python"
      pip install agentmail python-dotenv
      ```

      ```bash title="Node"
      npm install agentmail dotenv
      ```
    </CodeBlocks>
  </Step>

  <Step title="Create an inbox and send an email">
    Now you're ready to make your first API call. Create a new file (e.g.,
    `quickstart.py` or `quickstart.ts`) and add the following code. This script
    will initialize the AgentMail client, create a new inbox, and then send a
    test email.

    <CodeBlocks>
      ```python title="Python"
      import os
      from dotenv import load_dotenv
      from agentmail import AgentMail

      # Load the API key from the .env file
      load_dotenv()
      api_key = os.getenv("AGENTMAIL_API_KEY")

      # Initialize the client
      client = AgentMail(api_key=api_key)

      # Create an inbox
      print("Creating inbox...")
      inbox = client.inboxes.create() # domain is optional
      print("Inbox created successfully!")
      print(inbox)

      ```

      ```typescript title="TypeScript"
      import { AgentMailClient } from "agentmail";
      import "dotenv/config"; // loads .env file

      async function main() {
        // Initialize the client
        const client = new AgentMailClient({
          apiKey: process.env.AGENTMAIL_API_KEY,
        });

        // Create an inbox
        console.log("Creating inbox...");
        const inbox = await client.inboxes.create(); // domain is optional
        console.log("Inbox created successfully!");
        console.log(inbox);

        // Send an email from the new inbox
        console.log("Sending email...");
        await client.inboxes.messages.send(inbox.inbox_id, {
          to: "your-email@example.com",
          subject: "Hello from AgentMail!",
          text: "This is my first email sent with the AgentMail API.",
        });
        console.log("Email sent successfully!");
      }

      main();
      ```
    </CodeBlocks>

    <Note>
      The `domain` parameter is optional. If not provided, AgentMail will
      use the default `@agentmail.to` domain. If you would like a custom domain, please email [contact@agentmail.cc](mailto:contact@agentmail.cc)
    </Note>
  </Step>

  <Step title="Run the code">
    Execute the script from your terminal.

    <CodeBlocks>
      ```bash title="Python"
      python quickstart.py
      ```

      ```bash title="Node"
      npx ts-node quickstart.ts
      ```
    </CodeBlocks>

    You should see the details of your newly created inbox printed to the
    console. Congratulations, you've successfully created your first AgentMail
    inbox!
  </Step>
</Steps>

## Next Steps

Congrats, you sent your first email via AgentMail. But this isn't our strength. Explore the full power of creating agents that can autonomously reply, take action, parse attachements, semantically search your inbox, by exploring our docs and tutorials below.

<Note>
  Looking for a different language? Email us at
  [support@agentmail.cc](mailto:support@agentmail.cc) and we'll get you set up.
</Note>

```
```


# Inboxes

> Learn how AgentMail Inboxes act as scalable, API-first email accounts for your agents.

## What is an Inbox?

People are used to the traditional Gmail limitations -- only having one inbox. Thats of the past.

An `Inbox` is now a fully loaded, programmatically accessible API resource re-designed for the scale of AI Agents.

Think of it as being similar to a Gmail or Outlook account, but built API-first. Each `Inbox` has a unique email address and serves as the primary resource your agent uses to send and receive emails, giving it a first-class identity on the internet.

Unlike traditional email providers that are designed for human scale, AgentMail `Inboxes` are built to scale horizontally. You can create tens, hundreds, or even thousands of `Inboxes` for your agents on demand.

<Tip>
  Pssstt! Rather then sending 1000 emails from 1 `Inbox` sending 10 emails
  across 100 `Inboxes` actually improves deliverability! Read more about
  optimizing for deliverability [here](/best-practices/email-deliverability)
</Tip>

### The AgentMail Hierarchy

As the diagram below illustrates, your `organization` is the top-level container that holds all your resources. You can provision many `Inboxes` within your `organization`, each with its own `Threads`, `Messages`, and `Attachments`, allowing you to manage a large fleet of agents seamlessly.

<img src="file:ed1d5245-153e-4f50-8c7f-1e8e7b832466" alt="AgentMail Organizational Hierarchy" />

<Steps>
  <Step title="Organization">
    Your `organization` is the highest-level entity. It acts as a container for
    all your `Inboxes`, `Domains`, and API keys, allowing you to manage
    everything in one place.
  </Step>

  <Step title="Inbox">
    An `Inbox` is a single, scalable "email account" for your agent. You can
    create thousands of `Inboxes` within your organization, each with its own
    unique email address.
  </Step>

  <Step title="Thread">
    A `Thread` represents a single conversation. It groups together all replies
    and forwards related to an initial email, keeping your interactions
    organized.
  </Step>

  <Step title="Message">
    A `Message` is an individual email. It contains the content, sender,
    recipients, and any associated metadata or `Attachments`. You can cc humans
    at any point in time to keep a "human-in-the-loop"
  </Step>

  <Step title="Attachment">
    An `Attachment` is a file that is sent along with a `Message`. You can
    programmatically access and download attachments from incoming `Messages`.
  </Step>
</Steps>

## Core Capabilities

Here at AgentMail we've now made an `Inbox` is an API resource, meaning you can perform standard CRUD operations on it. Here are the core capabilities you'll use to manage your `Inboxes`.

<CodeBlocks>
  ```python title="Python"
  from agentmail import AgentMail

  # Initialize the client
  client = AgentMail(api_key="YOUR_API_KEY")

  # --- Create an Inbox ---
  # Creates a new inbox with a default agentmail.to domain
  new_inbox = client.inboxes.create()
  print(f"Created Inbox: {new_inbox.inbox_id}")

  # --- Retrieve an Inbox ---
  # Gets a specific inbox by its ID
  retrieved_inbox = client.inboxes.get(inbox_id = 'my_name@domain.com')
  print(f"Retrieved Inbox: {retrieved_inbox.inbox_id}")

  # --- List Inboxes ---
  # Lists all inboxes in your organization
  all_inboxes = client.inboxes.list()
  print(f"Total Inboxes: {len(all_inboxes)}")

  ```

  ```typescript title="TypeScript"
  import { AgentMailClient } from "agentmail";

  // Initialize the client
  const client = new AgentMailClient({ apiKey: "YOUR_API_KEY" });

  // --- Create an Inbox ---
  // Creates a new inbox with a default agentmail.to domain
  await client.inboxes.create({
  username: docs-testing,
  domain: domain.com,
  displayName: Docs Tester,
  });
  console.log(`Created Inbox: ${newInbox.id}`);

  // --- Retrieve an Inbox ---
  // Gets a specific inbox by its ID
  const inboxId = newInbox.id;
  const retrievedInbox = await client.inboxes.get(inboxId);
  console.log(`Retrieved Inbox: ${retrievedInbox.inbox_id}`);

  // --- List Inboxes ---
  // Lists all inboxes in your organization
  const allInboxes = await client.inboxes.list();
  console.log(`Total Inboxes: ${allInboxes.count}`);



  ```
</CodeBlocks>

<Tip>
  When creating an `Inbox`, the `username` and `domain` are optional. If you
  don't provide them, AgentMail will generate a unique address for you using our
  default domain. Check out our [guide on managing
  domains](/guides/domains/managing-domains) to learn more.
</Tip>


# Messages

> Learn how to send, receive, and manage emails as Message objects with the AgentMail API.

## What is a Message?

In the AgentMail ecosystem, a `Message` is the API-first representation of a traditional email. It's a structured object containing all the elements you'd expect: a sender, recipients, a subject line, and the body of the email.

Every `Message` lives inside a `Thread` to keep conversations organized. When you send a new `Message`, a new `Thread` is created. When you reply, the new `Message` is added to the existing `Thread`. Literally a normal email thread as we now it.

One of the powerful features of AgentMail is the ability to seamlessly include humans in agent-driven conversations. You can `cc` or `bcc` a real person on any message your agent sends, creating a "human-in-the-loop" workflow for oversight, escalations, or quality assurance.

## Core Capabilities

You can interact with `Message` resources in several ways, from sending new `Messages` to listing a history of correspondence.

### 1. Initialize the Client

First, you need to initialize the AgentMail client with your API key. This client object is your gateway to interacting with the AgentMail API.

<CodeBlocks>
  ```python title="Python"
  from agentmail import AgentMail

  client = AgentMail(api_key="YOUR_API_KEY")

  ```

  ```typescript title="TypeScript"
  import { AgentMailClient } from "agentmail";

  const client = new AgentMailClient({ apiKey: "YOUR_API_KEY" });
  ```
</CodeBlocks>

### 2. Send a New `Message`

To start a new conversation, you can send a `Message` from one of your inboxes. This action will create a new `Thread` and return the `Message` object.

<CodeBlocks>
  ```python title="Python"
  # You'll need an inbox ID to send from.
  # Let's assume we have one:

  sent_message = client.inboxes.messages.send(
  inbox_id = 'my_inbox@domain.com',
  to = 'recipient@domain.com',
  labels=[
  "outreach",
  "startup"
  ],
  subject="[YC S25] Founder Reachout ",
  text="Hello, I'm Michael, and I'm a founder at AgentMail...",
  html="<div dir=\"ltr\">Hello,<br /><br />I'm Michael, and I'm a founder at AgentMail...")

  print(f"Message sent successfully with ID: {sent_message.message_id}")

  ```

  ```typescript title="TypeScript"
  // You'll need an inbox ID to send from.

  const sentMessage = await client.inboxes.messages.send(
  	"outreach@agentmail.to", // this is your inbox you are trying to send from
  	{
      to: receipent@domain.com
  		labels: [
  				"outreach",
  				"startup"
  			],
  		subject: "[YC S25] Founder Reachout ",
  		text: "Hello, I'm Michael, and I'm a founder at AgentMail...",
  		html: "<div dir=\"ltr\">Hello,<br /><br />I'm Michael, and I'm a founder at AgentMail..."
  	}
  )

  console.log(`Message sent successfully with ID: ${sentMessage.id}`);
  ```
</CodeBlocks>

### 3. List `Messages` in an `Inbox`

You can retrieve a list of all `Messages` within a specific `Inbox`. This is useful for getting a history of all correspondence.

<CodeBlocks>
  ```python title="Python"

  all_messages = client.inboxes.messages.list(inbox_id='my_inbox@agentmail.to')

  print(f"Found {all_messages.count} messages in the inbox.")
  for message in all_messages:
  print(f"- Subject: {message.subject}")

  ```

  ```typescript title="TypeScript"

  const allMessages = await client.inboxes.messages.list("outreach@agentmail.to")

  console.log(`Found ${allMessages.count} messages in the inbox.`);
  allMessages.forEach((message) => {
    console.log(`- Subject: ${message.subject}`);
  });
  ```
</CodeBlocks>

### 4. Reply to a `Message`

Replying to an existing `Message` adds your new `Message` to the same `Thread`, keeping the conversation organized.

<CodeBlocks>
  ```python title="Python" wordWrap

  reply = client.inboxes.messages.reply(
  inbox_id = 'my_inbox@domain.com'
  message_id='msg_id',
  text="Thanks for the referral!",
  attachments=[
  SendAttachment(
  content="resume" # this would obviously be your resume content, refer to the attachment section of the core-concepts for more details
  )
  ]
  )

  print(f"Reply sent successfully with ID: {reply.message_id}")

  ```

  ```typescript title="TypeScript"


  const reply = await client.inboxes.messages.reply(
  	"my_inbox@domain.com",
  	"msg_id",
  	{
  		text: "Thanks for the referral!",
  		attachments: [
  				{
  					content: "resume"
  				}
  			]
  	}
  )

  console.log(`Reply sent successfully with ID: ${reply.id}`);
  ```
</CodeBlocks>

<Callout>
  Note that the `inbox_id` in reply is different from send, in that this is the
  `inbox_id` we are sending FROM. Remember we can have potentially infinite
  `Inboxes` to send from, so we need to tell the api which one we are sending
  from.
</Callout>

### 5. Get a `Message`

You can retrieve the details of any specific `Message` by providing its ID along with the `inbox_id` it belongs to.

<CodeBlocks>
  ```python title="Python"

  message = client.inboxes.messages.get(inbox_id = 'my_inbox@agentmail.to', message_id = 'msg_id')

  print(f"Retrieved message with subject: {message.subject}")

  ```

  ```typescript title="TypeScript"

  await client.inboxes.messages.get(
  	"my_inbox@domain.com",
  	"msg_id"
  )

  console.log(`Retrieved message with subject: ${message.subject}`);
  ```
</CodeBlocks>

### Crafting Your Message: HTML, Text, and CSS

When sending a `Message`, you can provide the body in two formats: `text` for a plain-text version and `html` for a rich, styled version.

* **`text`**: A simple, unformatted string. This is a fallback for email clients that don't render HTML, ensuring your message is always readable.
* **`html`**: A full HTML document. This allows you to create visually rich emails with custom layouts, colors, fonts, and images.

<Tip>
  **Best Practice**: Always send both `text` and `html` versions.
</Tip>

## "Why both text and HTML?"

Most modern email clients will display the HTML version, not all of them can render HTML -- a text fallback makes sure your message is displayed regardless. Furthermore it significantly improves deliverability.

#### Styling with CSS

To style your HTML in the `Message`, you should embed your CSS directly inside a `<style>` tag in the `<head>` in the payload of the API request. This is the most reliable method for ensuring your styles are applied correctly across different email clients like Gmail, Outlook, and Apple Mail.

Here is an example of a well-structured and styled HTML header:

<CodeBlocks>
  ```html title="Styled HTML Email Example"
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your AgentMail Invoice</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-wrapper {
          background: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .email-header {
          background-color: #000000;
          color: #ffffff;
          padding: 24px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .email-content {
          padding: 32px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .main-message {
          font-size: 16px;
          margin-bottom: 24px;
        }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #1a73e8;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 16px;
          margin-top: 8px;
          margin-bottom: 24px;
        }
        .invoice-details {
          background-color: #f8f9fa;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
          border: 1px solid #dee2e6;
        }
        .invoice-details p {
          margin: 0;
          font-size: 14px;
        }
        .invoice-details strong {
          color: #000;
        }
        .signature {
          margin-top: 24px;
          font-size: 14px;
          color: #555;
        }
        .email-footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6c757d;
        }
        .email-footer a {
          color: #1a73e8;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">
          <h1>AgentMail</h1>
        </div>
        <div class="email-content">
          <div class="greeting">Hi there,</div>
          <div class="main-message">
            Your invoice for the period of October 2025 is ready. We've automatically charged your saved payment method. Thank you for your business!
          </div>

          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> INV-2025-10-0123</p>
            <p><strong>Amount:</strong> $49.00</p>
            <p><strong>Status:</strong> Paid</p>
          </div>

          <a href="#" class="cta-button">View Full Invoice</a>

          <div class="signature">
            Best regards,<br />
            The AgentMail Team
          </div>
        </div>
      </div>
      <div class="email-footer">
        <p>&copy; 2025 AgentMail, Inc. All Rights Reserved.</p>
        <p><a href="#">Unsubscribe</a> | <a href="#">Billing Settings</a></p>
      </div>
    </body>
  </html>
  ```
</CodeBlocks>

<Frame caption="Look how pretty this message looks!">
  <img src="file:e9e2d9a6-d31b-4e1f-8741-d15014dd794e" alt="rendered css" />
</Frame>

## Receiving `Messages`

While you can periodically list `Messages` to check for new emails, the most efficient way to handle incoming `Messages` for your agents is with `Webhooks`. By configuring a `Webhook` endpoint, AgentMail can notify your application/agent in real-time as soon as a new `Message` arrives, so you can take action on them.

<CardGroup>
  <Card title="Guide: Webhooks" icon="fa-solid fa-bolt" href="/overview">
    Learn how to set up webhooks for real-time message processing.
  </Card>
</CardGroup>

```
```


# Threads

> Learn how AgentMail Threads group messages into conversations and how to query them across your entire organization.

## What is a Thread?

A `Thread` is an API resource that represents a single conversation. It acts as a container, grouping a series of related `Messages` together in chronological order, just like a conversation thread in a traditional email client.

`Threads` are created automatically. When your agent sends a `Message` that isn't a reply to a previous one, a new `Thread` is initiated. Any subsequent replies are automatically added to this same `Thread`, allowing your agent to easily maintain the context of a conversation over time.

## Querying `Threads`

While `Threads` are created implicitly, you can retrieve them in two powerful ways: scoped to a single `Inbox` or across your entire `Organization`.

### Listing `Threads` per `Inbox`

This is the standard way to retrieve all the conversations associated with a single agent or `Inbox`.

<CodeBlocks>
  ```python title="Python"
  # You'll need an inbox ID to list threads from.
  inbox_id = "inbound-agent@agentmail.to"

  # This retrieves all threads within the specified Inbox

  inbox_threads = client.inboxes.threads.list(inbox_id=inbox_id)

  ```

  ```typescript title="TypeScript"
  // You'll need an inbox ID to list threads from.
  const inboxId = "inbound-agent@agentmail.to";

  // This retrieves all threads within the specified Inbox
  const inboxThreads = await client.inboxes.threads.list(inbound-agent@agentmail.to);

  console.log(`Found ${inboxThreads.length} threads in Inbox ${inboxId}.`);
  ```
</CodeBlocks>

### Listing `Threads` Across an `Organization`

This is one of AgentMail's most powerful features. By omitting the `inbox_id`, you can retrieve a list of `Threads` from **every `Inbox`** in your `Organization`. This org-wide querying capability is essential for building:

* **Supervisor Agents:** An agent that monitors conversations from a fleet of other agents.
* **Analytics Dashboards:** Building something where you need visibility across all inboxes across the organization
* **Advanced Workflows:** Systems that can route or escalate conversations between different agents with different permissions.

<CodeBlocks>
  ```python title="Python"
  # By not providing an inbox_id, we get all threads in the organization
  all_threads = client.threads.list()

  print(f"Found {len(all_threads)} threads across the entire organization.")

  ```

  ```typescript title="TypeScript"
  // By not providing an inboxId, we get all threads in the organization
  const allThreads = await client.threads.list();

  console.log(`Found ${allThreads.length} threads across the entire organization.`);
  ```
</CodeBlocks>

<Callout title="Coming Soon: Org-Wide Semantic Search" intent="info">
  We are actively developing semantic search for the organization-wide thread
  listing endpoint. Soon, you'll be able to find `Threads` based on the meaning
  and concepts within the `Messages`, not just keywords.
</Callout>

### Getting a Single `Thread`

You can also retrieve a single `Thread` by its ID. This will return the `Thread` object, which typically contains a list of all its associated `Messages` and their ID's. A common workflow is listing the messages in a thread and calling the `messages.reply` method on the last one.

<CodeBlocks>
  ```python title="Python"
  thread_id = "thread_456def"

  # This retrieves a single thread and its messages

  thread = client.threads.get(
  thread_id="thread_id"
  )

  print(f"Retrieved thread {thread.id} with {len(thread.messages)} messages.")

  ```

  ```typescript title="TypeScript"
  const threadId = "thread_456def";

  // This retrieves a single thread and its messages
  const thread = await client.threads.get(
  	"thread_id"
  )

  console.log(`Retrieved thread ${thread.id} with ${thread.messages.length} messages.`);
  ```
</CodeBlocks>


# Drafts

> Learn how to create, manage, and send Drafts to enable advanced agent workflows like human-in-the-loop review and scheduled sending.

## What is a Draft?

A `Draft` is an unsent `Message`. It's a resource that allows your agent to prepare the contents of an email—including recipients, a subject, a body, and `Attachments`—without sending it immediately.

We know agent reliability is big these days--with `Drafts` you can have agents have ready-to-send emails and only with your permission it can send them off into the world.

`Drafts` are a key component for building advanced agent workflows. They enable:

* **Human-in-the-Loop Review:** An agent can create a `Draft` for a sensitive or important `Message`, which a human can then review and approve before it's sent.
* **Scheduled Sending:** Your agent can create a `Draft` and then have a separate process send it at a specific time, such as during business hours for the recipient.
* **Complex Composition:** For `Messages` that require multiple steps to build (e.g., fetching data from several sources, generating content), `Drafts` allow you to save the state of the email as it's being composed.

## The `Draft` Lifecycle

You can interact with `Drafts` throughout their lifecycle, from creation to the moment they are sent.

### 1. Create a `Draft`

This is the first step. You create a `Draft` in a specific `Inbox` that will eventually be the sender.

<CodeBlocks>
  ```python title="Python"
  # You'll need an inbox ID to create a draft in.

  new_draft = client.inboxes.drafts.create(
  inbox_id="outbound@domain.com",
  to=["review-team@example.com"],
  subject="[NEEDS REVIEW] Agent's proposed response"
  )

  print(f"Draft created successfully with ID: {new_draft.draft_id}")

  ```

  ```typescript title="TypeScript"
  // You'll need an inbox ID to create a draft in.

  const newDraft = await client.inboxes.drafts.create(
  	"my_inbox@domain.com",
  	{
  		to: [
  				"review-team@example.com"
  			],
  		subject: "[NEEDS REVIEW] Agent's proposed response"
  	}
  )

  console.log(`Draft created successfully with ID: ${newDraft.id}`);
  ```
</CodeBlocks>

### 2. Get `Draft`

Once a `Draft` is created, you can retrieve it by its ID

<CodeBlocks>
  ```python title="Python"
  # Get the draft
  draft = client.inboxes.drafts.get(inbox_id = 'my_inbox@domain.com, draft_id = 'draft_id_123')

  ```

  ```typescript title="TypeScript"

  // Get the draft
  const draft =await client.inboxes.drafts.get(
  	"inbox_id",
  	"draft_id_123"
  )

  ```
</CodeBlocks>

### 3. Send a `Draft`

This is the final step that converts the `Draft` into a sent `Message`. Once sent, the `Draft` is deleted.

<CodeBlocks>
  ```python title="Python"

  # This sends the draft and deletes it

  sent_message = client.inboxes.drafts.send(inbox_id = 'my_inbox@domain.com', draft_id = 'draft_id_123')

  print(f"Draft sent! New message ID: {sent_message.message_id}")

  ```

  ```typescript title="TypeScript"

  const sentMessage = await client.inboxes.drafts.send('my_inbox@domain.com', 'draft_id_123');

  console.log(`Draft sent! New message ID: ${sentMessage.message_id}`);
  ```
</CodeBlocks>

Note that now we access it by message\_id now because now its a message!!

## Org-Wide `Draft` Management

Similar to `Threads`, you can list all `Drafts` across your entire `Organization`. This is perfect for building a central dashboard where a human supervisor can view, approve, or delete any `Draft` created by any agent in your fleet.

<CodeBlocks>
  ```python title="Python"
  # Get all drafts across the entire organization
  all_drafts = client.drafts.list()

  print(f"Found {all_drafts.count} drafts pending review.")

  ```

  ```typescript title="TypeScript"
  // Get all drafts across the entire organization
  const allDrafts = await client.drafts.list();

  console.log(`Found ${allDrafts.count} drafts pending review.`);
  ```
</CodeBlocks>


# Labels

> Learn how to use Labels to manage state, track campaigns, and filter messages for powerful agentic workflows.

## What are `Labels`?

`Labels` are simple, string-based tags that you can attach to your `Messages` and `Threads`. They are the primary mechanism for organizing, categorizing, and managing the state of your conversations, whether its automatically bucketing threads into specific categories for your outbound campaign, to segmenting warm leads for your outreach, to categorizing inbound into low-ticket, medium-ticket, high-ticket customers.

A `Message` can have multiple `Labels`, allowing you to create a flexible and powerful system for managing complex workflows.

## Use Cases for `Labels`

By strategically applying `Labels`, you can build sophisticated agent systems. Here are a few common use cases:

<Steps>
  <Step title="State Management">
    Use `Labels` to track the state of a conversation. For example, an agent
    could apply `needs-human-review` when it's unsure how to respond, or a
    supervisor could apply `approved-to-send` to a `Draft`.
  </Step>

  <Step title="Campaign Tracking">
    When running outbound campaigns, tag every `Message` with a unique campaign
    `Label` like `q4-2024-outreach`, or `mercor-campaign` and adding a second
    tag as `warm-lead`. This allows you to easily filter for and analyze the
    performance of that specific campaign later on.
  </Step>

  <Step title="Automated Triage">
    An inbound agent can classify incoming `Messages` with `Labels` like
    `billing-question`, `feature-request`, or `bug-report`, allowing specialized
    agents or human teams to handle them efficiently.
  </Step>
</Steps>

## Core Capabilities

Here's how you can programmatically work with `Labels`.

### 1. Adding `Labels` When Sending a `Message`

You can attach an array of `Labels` directly when you send a `Message`.

<CodeBlocks>
  ```python title="Python"
  sent_message = client.inboxes.messages.send(
      inbox_id="outbound@agentmail.to",
      to=["test@example.com"],
      subject="Following up on our conversation",
      text="Here is the information you requested.",
      labels=["follow-up", "q4-campaign"]
  )
  ```

  ```typescript title="TypeScript"
  const sentMessage = await client.inboxes.messages.send(
    "outbound@agentmail.to",
    {
      to: ["test@example.com"],
      subject: "Following up on our conversation",
      text: "Here is the information you requested.",
      labels: ["follow-up", "q4-campaign"],
    }
  );
  ```
</CodeBlocks>

### 2. Adding or Removing `Labels` on an Existing `Message`

You can modify the `Labels` on a `Message` that has already been sent using the `update` (PATCH) method. This is perfect for changing the state of a conversation as your agent works on it.

<CodeBlocks>
  ```python title="Python"
  # Let's add a 'resolved' label to a message

  client.messages.update(
  inbox_id='outbound@domain.com',
  message_id='msg_id_123',
  add_labels=["resolved"],
  remove_labels=['unresolved']
  )

  ```

  ```typescript title="TypeScript"
  // Let's add a 'resolved' label to a message


  await client.inboxes.messages.update(
  	"my_inbox@domain.com",
  	"msg_id_123",
  	{
  		addLabels: [
  				"resolved"
  			],
  		removeLabels: [
  				"unresolved"
  			]
  	}
  )

  ```
</CodeBlocks>

### 3. Filtering by `Labels`

This is where `Labels` become truly powerful. You can list `Threads`, `Messages`, and `Drafts` by filtering for one or more `Labels`, allowing you to create highly targeted queries.

<CodeBlocks>
  ```python title="Python"
  # Find all threads from a specific campaign that need a follow-up
  client.inboxes.threads.list(
      inbox_id = 'outbound-agent@domain.com',
  	labels=[
  		"q4-campaign",
  		"follow_up"
  	]
  )

  print(f"Found {len(filtered_threads)} threads that need a follow-up.")

  ```

  ```typescript title="TypeScript"
  // Find all threads from a specific campaign that need a follow-up
  await client.inboxes.threads.list(
  	"leads@agentmail.to",
  	{
  		labels: [
  			"q4-campaign",
  			"follow_up"
  		]
  	}
  )


  console.log(`Found ${filteredThreads.length} threads that need a follow-up.`);
  ```
</CodeBlocks>

## Best Practices

* **Be Consistent:** Establish a clear and consistent naming convention for your labels (e.g., `kebab-case`, `snake_case`).
* **Use Prefixes:** For state management, consider using prefixes like `status-pending` or `priority-high` to create an organized system.
* **Don't Over-Label:** While you can add many `Labels`, aim for a concise and meaningful set to keep your system manageable.

<Callout title="Coming Soon: AI-Powered Auto-Labeling" intent="info">
  We are actively developing an AI-powered auto-labeling feature. Soon, your
  agents will be able to provide a set of `Labels` and instructions, and
  AgentMail will automatically apply the correct `Labels` to incoming `Messages`
  based on their content.
</Callout>


# Attachments

> Learn how to send files as attachments, and download incoming attachments from both messages and threads.

## What are `Attachments`?

An `Attachment` is a file that is associated with a `Message`. This can be anything from a PDF invoice to a CSV report or an image(though we don't recommend sending images in the first email sent. We go more into this in the [deliverability section](/deliverability)). Your agents can both send `Attachments` in outgoing `Messages` and process `Attachments` from incoming `Messages`.

## Sending `Attachments`

To send a file, you include it in an `Attachments` array when sending a `Message`. Each object in the array represents one file and must have a `content` property.

* **`content`** (required): The Base64 encoded content of your file.
* **`filename`** (optional): The name of the file (e.g., `invoice.pdf`).
* **`content_type`** (optional): The MIME type of the file (e.g., `application/pdf`).

<CodeBlocks>
  ```python title="Python"
  import base64

  # A simple text file for this example

  file_content = "This is the content of our report."

  # You must Base64 encode the file content before sending

  encoded_content = base64.b64encode(file_content.encode()).decode()

  sent_message = client.messages.send(
  inbox_id="reports@agentmail.to",
  to=["supervisor@example.com"],
  subject="Q4 Financial Report",
  text="Please see the attached report.",
  attachments=[{
  "content": encoded_content,
  "filename": "Q4-report.txt",
  "content_type": "text/plain"
  }]
  )

  ```

  ```typescript title="TypeScript"
  // A simple text file for this example
  const fileContent = "This is the content of our report.";
  // You must Base64 encode the file content before sending
  const encodedContent = Buffer.from(fileContent).toString("base64");

  const sentMessage = await client.messages.send("reports@agentmail.to", {
    to: ["supervisor@example.com"],
    subject: "Q4 Financial Report",
    text: "Please see the attached report.",
    attachments: [{
      content: encodedContent,
      filename: "Q4-report.txt",
      contentType: "text/plain",
    }],
  });
  ```
</CodeBlocks>

## Retrieving `Attachments`

To retrieve an `Attachment`, you first need its `attachment_id`. You can get this ID from the `attachments` array on a `Message` object. Once you have the ID, you can download the file.

The API response for getting an attachment is the raw file itself, which you can then save to disk or process in memory.

### From a Specific `Message`

If you know the `Message` an `Attachment` belongs to, you can retrieve it directly.

<CodeBlocks>
  ```python title="Python"
  inbox_id = "inbox_123"
  message_id = "msg_456"
  attachment_id = "attach_789" # From the message object

  file_data = client.inboxes.messages.attachments.get(
  inbox_id=inbox_id,
  message_id=message_id,
  attachment_id=attachment_id
  )

  # Now you can save the file

  with open("downloaded_file.pdf", "wb") as f:
  f.write(file_data)

  ```

  ```typescript title="TypeScript"
  const inboxId = "inbox_123";
  const messageId = "msg_456";
  const attachmentId = "attach_789"; // From the message object

  const fileData = await client.inboxes.messages.attachments.get(
    inboxId,
    messageId,
    attachmentId
  );

  // fileData is a Blob/Buffer that you can process
  // For example, in Node.js:
  // import fs from 'fs';
  // fs.writeFileSync('downloaded_file.pdf', fileData);
  ```
</CodeBlocks>

### From a Specific `Thread`

Similarly, you can retrieve an `Attachment` if you know the `Thread` it's in, which can be more convenient for multi-message conversations.

<CodeBlocks>
  ```python title="Python"
  inbox_id = "inbox_123"
  thread_id = "thread_abc"
  attachment_id = "attach_789" # From a message within the thread

  file_data = client.inboxes.threads.attachments.get(
  inbox_id=inbox_id,
  thread_id=thread_id,
  attachment_id=attachment_id
  )

  ```

  ```typescript title="TypeScript"
  const inboxId = "inbox_123";
  const threadId = "thread_abc";
  const attachmentId = "attach_789"; // From a message within the thread

  const fileData = await client.inboxes.threads.attachments.get(
    inboxId,
    threadId,
    attachmentId
  );
  ```
</CodeBlocks>


# Guide: Sending & Receiving Email

> A step-by-step guide to the practical workflow of sending initial emails and handling replies to have a full conversation.

This guide walks you through the complete, practical workflow of an agent having a conversation. While the `Core Concepts` pages detail the individual API calls, this guide shows you how to stitch them together to create a functional conversational loop.

## The Foundation: Sending HTML & Text

As a quick reminder from our `Messages` documentation, it's a critical best practice to always provide both an `html` and a `text` version of your email. This ensures readability on all email clients and significantly improves deliverability.

```python
# Always provide both html and text when possible
client.messages.send(
    inbox_id="outreach@agentmail.to",
    to=["potential-customer@example.com"],
    subject="Following up",
    text="Hi Jane,\n\nThis is a plain-text version of our email.",
    html="<p>Hi Jane,</p><p>This is a <strong>rich HTML</strong> version of our email.</p>",
    labels=["outreach-campaign"]
)
```

## The Conversational Loop

A common task for an agent is to check for replies in an `Inbox` and then respond to them. While using `Webhooks` is the most efficient method for this, you can also build a simple polling mechanism.

Here's the step-by-step logic for a polling-based conversational agent.

<Steps>
  <Step title="1. Find a Thread that Needs a Reply">
    First, you need to identify which conversations have new messages that your agent hasn't responded to. A great way to manage this is with `Labels`. You can list `Threads` in a specific `Inbox` that have an `unreplied` `Label`.

    <CodeBlocks>
      ```python
      # Find all threads in this inbox that are marked as unreplied
      threads = client.threads.list(
          labels=["unreplied"]
      )
      if not threads:
          print("No threads need a reply.")
      else:
          # Let's work on the first unreplied thread
          thread_to_reply_to = threads[0]
      ```

      ```typescript
      // Find all threads in this inbox that are marked as unreplied
      const threads = await client.threads.list(
          {
              labels: [
                  "huh"
              ]
          }
      )

      if (threads.length === 0) {
          console.log("No threads need a reply.");
      } else {
          // Let's work on the first unreplied thread
          const threadToReplyTo = threads[0];
      }
      ```
    </CodeBlocks>
  </Step>

  <Step title="2. Get the Last Message ID from the Thread">
    To reply to a conversation, you need to reply to the *most recent message* in the `Thread`. You can get a specific `Thread` by its ID, which will contain a list of all its `Messages`. You'll then grab the ID of the last `Message` in that list.

    <CodeBlocks>
      ```python
      # Get the full thread object to access its messages
      thread_details = client.threads.get(thread_to_reply_to.id)

      # The last message in the list is the one we want to reply to
      last_message = thread_details.messages[-1]
      message_id_to_reply_to = last_message.id
      ```

      ```typescript
      // Get the full thread object to access its messages
      const threadDetails = await client.threads.get('thread_id');

      // The last message in the array is the one we want to reply to
      const lastMessage = threadDetails.messages[threadDetails.messages.length - 1];
      const messageIdToReplyTo = lastMessage.id;
      ```
    </CodeBlocks>
  </Step>

  <Step title="3. Send the Reply and Update Labels">
    Now that you have the `message_id` to reply to, you can send your agent's response. It's also a best practice to update the `Labels` on the original `Message` at the same time, removing the `unreplied` `Label` and adding a `replied` `Label` to prevent the agent from replying to the same message twice.

    <CodeBlocks>
      ```python
      # Send the reply
      client.messages.reply(
          inbox_id="support@agentmail.to",
          message_id=message_id_to_reply_to,
          text="This is our agent's helpful reply!"
      )

      # Update the labels on the original message
      client.messages.update(
          inbox_id="support@agentmail.to",
          message_id=message_id_to_reply_to,
          add_labels=["replied"],
          remove_labels=["unreplied"]
      )
      ```

      ```typescript
      // Send the reply
      await client.messages.reply("support@agentmail.to", messageIdToReplyTo, {
          text: "This is our agent's helpful reply!",
      });

      // Update the labels on the original message
      await client.messages.update("support@agentmail.to", messageIdToReplyTo, {
          addLabels: ["replied"],
          removeLabels: ["unreplied"],
      });
      ```
    </CodeBlocks>
  </Step>
</Steps>

<Callout intent="success" title="Real-Time Processing with Webhooks">
  For production applications, polling is inefficient. The best way to handle incoming replies is to use `Webhooks`. This allows AgentMail to notify your agent instantly when a new `Message` arrives, so you can reply in real-time.

  [**Learn how to set up `Webhooks` →**](/overview)
</Callout>


# Using Custom Domains

> A step-by-step guide to configuring your custom domain with AgentMail for enhanced branding and trust.

## Why Use a Custom Domain?

When you're deploying AI agents that send email at scale, deliverability and trust are paramount. While the default `@agentmail.to` domain is great for getting started, using your own custom domains is essential for production applications. It gives you control over your sending reputation and enables advanced strategies for high-volume outreach.

<CardGroup>
  <Card title="Improved Deliverability" icon="fa-solid fa-envelope-circle-check">
    Each domain builds its own sending reputation. By using your own domain, you
    control this reputation, which is the single most important factor in
    reaching the inbox.
  </Card>

  <Card title="Scale with Multiple Domains" icon="fa-solid fa-network-wired">
    For high-volume sending, register multiple domains (e.g., `mercor.com`,
    `usemercor.com`, `mercorapp.com`). Spreading email volume across them is a
    key strategy to maximize deliverability.
  </Card>
</CardGroup>

## Setting Up Your Custom Domain

Configuring your domain is a three-step process: add the domain via API, copy the provided records into your DNS provider, and wait for verification.

<Steps>
  <Step title="1. Create Domain & Get DNS Records">
    To begin, make an API request to the `POST /domains/{domain}` endpoint with your domain name. AgentMail will register your domain and immediately return the full set of DNS records required for verification.

    <CodeBlocks>
      `bash curl -X POST https://api.agentmail.to/domains/your-domain.com `
    </CodeBlocks>

    <Callout type="info" title="Feedback Forwarding">
      By default, bounce and complaint notifications are sent to your domain. You
      can disable this by setting `feedback_forwarding` to `false` in your request.
      If not specified it is default set to `true`
    </Callout>

    The API response includes a `records` array. Each object in this array contains the precise `name`, `type`, `value`, and `priority` you'll need to add to your DNS provider.

    The initial `status` of the domain will be `pending`. It will change as you configure your domain and we verify it on our end.
  </Step>

  <Step title="2. Add Records to Your DNS Provider">
    The process for adding records varies slightly between providers. The examples below assume you are configuring the root domain `domain.com`.

    <Callout title="Configuring a Subdomain?">
      If you're using a subdomain (e.g., `payment.domain.com`), the instructions are
      the same, but you must PREPEND the subdomain to the record NAME VALUE. For
      example, a `_dmarc` record for `domain.com` becomes `_dmarc.payment` for
      `payment.domain.com`. For records on the subdomain itself (like an MX record
      for `payment.domain.com`), the name would simply be `payment`.
    </Callout>

    Below are detailed instructions for AWS Route53 and Cloudflare. If you would like detailed instructions on your specific domain provider in this section please contact us [contact@agentmail.cc](mailto:contact@agentmail.cc)

    <Tabs>
      <Tab title="AWS Route 53">
        In your hosted zone, click **"Create record"**.

        * **CNAME (DKIM):**
          * **Record name:** Enter the part of the `name` before your root domain (e.g., `{random_letters_numbers}._domainkey` for a `name` of `{random_letters_numbers}._domainkey.domain.com`).
          * **Value:** Can directly copy paste the `value` from the API response (e.g., `{random_letters_numbers}.dkim.amazonses.com`).

        <Frame caption="Example of adding a CNAME record in Route 53. Notice that AWS already appends the root domain (agentmail.cc) to the end of the name value!">
          <img src="file:08267a00-87a1-4414-b8d3-43dea8e84565" alt="AWS Route 53 Record Configuration" />
        </Frame>

        * **TXT (DMARC/SPF):**
          * **Record name:** Enter the part of the `name` before your root domain (e.g., `_dmarc` for a `name` of `_dmarc.domain.com`, or `mail` for a `name` of `mail.domain.com`).
          * **Value:** Can copy paste the`value` from the API, ensuring it is enclosed in quotes.

        * **MX:**
          * **Record name:** Leave this field blank to apply the record to the root domain.
          * **Value:** This is critical. You must combine the `priority` and `value` from the API into a single string, separated by a space. For example: `10 inbound-smtp.us-east-1.amazonaws.com`.
      </Tab>

      <Tab title="Cloudflare">
        In the dashboard (**DNS > Records**), click **"Add record"**.

        * **CNAME (DKIM):**
          * **Name:** Enter the part of the `name` before your root domain (e.g., `{random_letters_numbers}._domainkey`).
          * **Target:** Copy paste the `value` from the API response.

        * **TXT (DMARC/SPF):**
          * **Name:** Enter the part of the `name` before your root domain (e.g. `_dmarc`).
          * **Content:** Copy paste the `value` from the API response.

        * **MX:**
          * **Name:** Enter `@` to apply the record to the root domain.
          * **Mail server:** Enter the `value` from the API.
          * **Priority:** Enter the `priority` from the API.
      </Tab>
    </Tabs>
  </Step>

  <Step title="3. Verify Your Domain">
    Once you've added the records, AgentMail automatically begins to check them. This can take anywhere from a few minutes to 48 hours for your DNS changes to propagate across the internet.

    You can poll the `GET /domains/{domain}` endpoint to check the verification progress. The `status` field in the response will tell you exactly where you are in the process:

    * **`pending`**: This means you still need to add or fix your DNS records. The `records` array in the response will show you which records are still missing or invalid.
    * **`verifying`**: This is a great sign! It means our system has confirmed your DNS records are correct, and we are now authorizing the domain with our underlying email infrastructure. No action is needed from you—just a little more patience.
    * **`ready`**: This is the final step. Your domain is fully verified and ready for sending. You can now create inboxes and start sending emails.
  </Step>
</Steps>

Here are instructions for some common DNS providers. This list is not exhaustive, so please consult your provider's documentation if you don't see it here.

| DNS/Hosting Provider | Documentation Link                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GoDaddy**          | [CNAME: Add a CNAME record](https://www.godaddy.com/help/add-a-cname-record-19236) <br /> [MX: Add an MX record](https://www.godaddy.com/help/add-an-mx-record-19234) <br /> [TXT: Add a TXT record](https://www.godaddy.com/help/add-a-txt-record-19232)                                                                                                                                                                                                                                                                                                   |
| **DreamHost**        | [CNAME/MX/TXT: How do I add custom DNS records?](https://help.dreamhost.com/hc/en-us/articles/215414867-How-do-I-add-custom-DNS-records)                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Cloudflare**       | [MX: How do I add or edit mail or MX records?](https://support.cloudflare.com/hc/en-us/articles/200168806-Managing-DNS-records-in-Cloudflare) <br /> [TXT: Managing DNS records in Cloudflare](https://support.cloudflare.com/hc/en-us/articles/200168806-Managing-DNS-records-in-Cloudflare)                                                                                                                                                                                                                                                               |
| **HostGator**        | [CNAME/MX/TXT: Manage DNS Records with HostGator/eNom](https://www.hostgator.com/help/article/manage-dns-records-with-hostgator-enom)                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Namecheap**        | [CNAME: How to create a CNAME record](https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/) <br /> [MX: How can I set up MX records required for mail service?](https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-can-i-set-up-mx-records-required-for-mail-service) <br /> [TXT: How do I add TXT/SPF/DKIM/DMARC records for my domain?](https://www.namecheap.com/support/knowledgebase/article.aspx/317/2237/how-do-i-add-txtspfdkimdmarc-records-for-my-domain) |
| **Names.co.uk**      | [CNAME/MX/TXT: Changing your domain's DNS settings](https://www.names.co.uk/support/articles/changing-your-domains-dns-settings/)                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Wix**              | [CNAME: Adding or Updating CNAME Records](https://support.wix.com/en/article/adding-or-updating-cname-records-in-your-wix-account) <br /> [MX: Adding or Updating MX Records in Your Wix Account](https://support.wix.com/en/article/adding-or-updating-mx-records-in-your-wix-account) <br /> [TXT: Adding or Updating TXT Records in Your Wix Account](https://support.wix.com/en/article/adding-or-updating-txt-records-in-your-wix-account)                                                                                                             |

<Callout type="success" title="Ready to Go!" icon="fa-solid fa-rocket">
  Once your domain status is `ready`, you can start creating `Inboxes` with your
  custom domain and building your agents!
</Callout>

## Troubleshooting Common DNS Issues

DNS can be tricky. Here are some common issues and how to resolve them.

<AccordionGroup>
  <Accordion title="My DNS changes aren't showing up instantly">
    DNS propagation can take up to 48 hours, though it's often much faster. If
    it's been a while, double-check by hitting the `GET /domains/{domain}`
    endpoint to check the status. It will tell you exactly which records are
    configured correctly or missing.
  </Accordion>

  <Accordion title="I'm seeing 'Too many SPF records' errors">
    A domain must have only **one** SPF record. If you're using other services that send email on your behalf (like a CRM), you need to merge their SPF policies with AgentMail's into a single record.

    An SPF record is a single line of text. It starts with `v=spf1` and ends with a mechanism like `~all` or `-all`. All your permitted senders go in the middle.

    **How to Merge:**

    1. **Find your existing SPF record.** It will look something like this: `v=spf1 include:_spf.other-domain.com ~all`
    2. **Find AgentMail's SPF include.** This is `include:spf.agentmail.to`.
    3. **Combine them.** Copy the `include` from AgentMail and place it into your existing record, right before the `~all` or `-all` part.

    <CodeBlocks>
      ```text title="Example: Merging SPF records"
      # Before
      v=spf1 include:_spf.other-domain.com ~all

      # After
      v=spf1 include:_spf.other-domain.com include:spf.agentmail.to ~all
      ```
    </CodeBlocks>

    Just keep adding `include:` mechanisms for each service you use. Remember to only have one `v=spf1` at the beginning and one `~all` or `-all` at the end.
  </Accordion>
</AccordionGroup>

{/* The user will write this section themselves. */}

## Best Practices for Domain Management

Check out our guide on [Email Deliverability](/best-practices/email-deliverability) for tips on warming up your new domain and maintaining a healthy sender reputation.


# Managing Your Domains

> Learn how to manage your custom domains effectively using AgentMail's API for enhanced deliverability and reputation management.

## From Setup to Strategy

You've successfully set up your first custom domain—now what?

## Core Domain Operations via API

Your domains are resources that can be fully managed through the API. Here are the core operations you'll use.

<AccordionGroup>
  <Accordion title="List All Your Domains">
    To get a complete overview of all the domains registered in your organization, use the `GET /domains` endpoint. This is useful for auditing your assets and programmatic checks.

    <EndpointRequestSnippet endpoint="GET /domains" title="List All Domains" />
  </Accordion>

  <Accordion title="Check Domain Health">
    DNS records can sometimes be accidentally changed or deleted, impacting your ability to send or receive email. You should periodically monitor the health of your domains by polling the `GET /domains/{domain}` endpoint.

    Pay close attention to the `status` field for both the domain and its individual records. If a record's status changes from `verified` to `missing`, it needs immediate attention.

    <EndpointRequestSnippet endpoint="GET /domains/{domain}" title="Check a Specific Domain" />
  </Accordion>

  <Accordion title="Delete a Domain">
    If you no longer need a domain, you can remove it using the `DELETE /domains/{domain}` endpoint.

    <Callout type="danger">
      **This action is permanent and cannot be undone.** Deleting a domain will immediately prevent any inboxes associated with it from sending or receiving email. BUT you will still have access to the data in these inboxes.
    </Callout>

    <EndpointRequestSnippet endpoint="DELETE /domains/{domain}" title="Delete a Domain" />
  </Accordion>
</AccordionGroup>

## Advanced Strategies for Agent Fleets

As you scale, your domain strategy must evolve beyond a single domain. A sophisticated approach is crucial for deliverability, security, and resilience.

### Strategy 1: Isolate Reputations with Subdomains

Different agents have different sending patterns and risk profiles. A transactional agent sending receipts is low-risk, while a cold outreach agent is high-risk. Mixing their traffic on the same domain means the high-risk agent can damage the reputation of the critical transactional one.

**The Solution:** Segment agents onto different subdomains to isolate their sending reputations.

* **`billing.your-company.com`**: For critical transactional agents (receipts, invoices).
* **`outreach.your-company.com`**: For high-volume sales or marketing agents.
* **`support.your-company.com`**: For customer service and support agents.

### Strategy 2: Scale Deliverability with Domain Pooling

When sending at a very high scale, even a perfectly warmed-up domain has a daily sending limit before providers start throttling. The professional-grade solution is "domain pooling."

Instead of relying on one domain, you build a pool of multiple root domains (e.g., `company.com`, `company.net`, `get-company.com`).

**The Solution:** Programmatically spread your email volume across this pool.

* Maintain an array of your sending domains in your application.
* When sending a large batch of emails, rotate through the array to assign the sending inbox.
* This diversification significantly improves inbox placement at scale and makes your system more resilient if one domain's reputation is temporarily impacted.

## Leveraging DMARC for Security

By default, AgentMail configures your domain with a strict DMARC policy (`p=reject`). This is the best possible setting for security, as it tells receiving mail servers to block any email that fails authentication.

However, this is obviously up to your discretion if you want to impose a more relaxed DMARC policy, whether its `p=none` where it doesn't do anything if both SPF and DMARC fail, or its `p=quarantine`, where it puts the mail in spam/junk. Feel free to do more research at your own discretion. You can do this by changing the value in the TXT record in your DNS configuration where the name starts with `_dmarc`.


# Integrate LiveKit Agents

> A step-by-step guide to integrate with the LiveKit Agents SDK.

## Overview

This guide walks you through building a voice assistant with real time email capabilites. We use the LiveKit Agents SDK to build the voice functionality.

## Prequisites

Follow the [LiveKit voice AI quickstart](https://docs.livekit.io/agents/start/voice-ai/) to build a simple voice assistant. In this guide we will extend the functionality to this assistant to email.

You should have a file named `agent.py` which we will modify.

## Setup

Install python packages

```shell
pip install agentmail agentmail-toolkit
```

Set environment variables

```env
AGENTMAIL_API_KEY=<Your AgentMail API key>
AGENTMAIL_USERNAME=<Choose a username for your agent's inbox>
```

## Code

To the `agent.py` file add the following imports

```python
import os
import asyncio

from agentmail import AgentMail, AsyncAgentMail, Subscribe, MessageReceived
from agentmail_toolkit.livekit import AgentMailToolkit
```

Then add the `EmailAssistant` class

```python
class EmailAssistant(Agent):
    inbox_id: str
    ws_task: asyncio.Task | None = None

    def __init__(self) -> None:
        client = AgentMail()

        # By setting the client_id the inbox is created only once.
        username = os.getenv("AGENTMAIL_USERNAME")
        inbox = client.inboxes.create(username=username, client_id=f"{username}-inbox")

        self.inbox_id = inbox.inbox_id

        super().__init__(
            instructions=f"""
            You are a helpful voice and email AI assistant. Your name is AgentMail. You can receive emails at {self.inbox_id}. You can also send and reply to emails.
            When using email tools, use "{self.inbox_id}" as the inbox_id parameter. When writing emails, include "AgentMail" in the signature.
            Always speak in English.
            IMPORTANT: {self.inbox_id} is your inbox, not the user's inbox.
            """,
            # The AgentMail Toolkit has ready-to-go tools for LiveKit agents.
            tools=AgentMailToolkit(client=client).get_tools(
                [
                    "list_threads",
                    "get_thread",
                    "get_attachment",
                    "send_message",
                    "reply_to_message",
                ]
            ),
        )

    async def _websocket_task(self):
        # Open a websocket connection to AgentMail.
        async with AsyncAgentMail().websockets.connect() as socket:
            # Subscribe to events from the inbox.
            await socket.send_subscribe(Subscribe(inbox_ids=[self.inbox_id]))

            while True:
                data = await socket.recv()

                # If a message is received by the inbox, interrupt the current conversation and generate a reply.
                if isinstance(data, MessageReceived):
                    self.session.interrupt()

                    await self.session.generate_reply(
                        instructions=f"""Say "I've received an email" and then read the email.""",
                        user_input=data.message.model_dump_json(),
                    )

    # Open the websocket connection and generate a greeting when the agent enters the call.
    async def on_enter(self):
        self.ws_task = asyncio.create_task(self._websocket_task())

        await self.session.generate_reply(
            instructions=f"""In English, greet the user, introduce yourself as AgentMail, inform them that you can "receive emails" at {self.inbox_id}, and offer your assistance.""",
            allow_interruptions=False,
        )

    # Close the websocket connection when the agent exits the call.
    async def on_exit(self):
        if self.ws_task:
            self.ws_task.cancel()
```

Finally update the `entrypoint` function

```python
await session.start(
    room=ctx.room,
    agent=EmailAssistant(),  # Replace Assistant with EmailAssistant.
    room_input_options=RoomInputOptions(
        noise_cancellation=noise_cancellation.BVC()
    ),
)
```

## That's It

Run your agent inside the terminal and send it an email

```shell
python agent.py console
```


# Webhooks Overview

> Learn how to use Webhooks to build responsive, event-driven email agents with AgentMail.

Webhooks are the best way to get real-time information about what's happening with your emails. Instead of constantly asking the AgentMail API if there's a new email (a process called polling), you can register a URL, and we will send you a `POST` request with the details as soon as an event happens.

This event-driven approach is more efficient and allows you to build fast, responsive agents that can react instantly to incoming messages.

## Why Use Webhooks?

* **Real-Time Speed:** Build conversational agents that can reply to incoming emails in seconds.
* **Efficiency:** Eliminates the need for constant polling, which saves you computational resources and simplifies your application logic.

## The Webhook Workflow

The process is straightforward:

<Steps>
  <Step title="1. Create a Webhook Endpoint">
    This is a public URL on your server that can accept `POST` requests. For local development, a tool like `ngrok` is perfect for creating a secure, public URL that tunnels to your local machine. Your endpoint should immediately return a `200 OK` response to acknowledge receipt and process the payload in the background to avoid timeouts.
  </Step>

  <Step title="2. Register the Endpoint with AgentMail">
    You can register your URL using the AgentMail API. When you create a webhook, you'll specify your endpoint's URL. As AgentMail currently only supports the `message.received` event, there's no need to specify event types.

    <CodeBlocks>
      ```python
      client.webhooks.create(
          url="https://<your-ngrok-url>.ngrok-free.app/webhooks"
      )
      ```

      ```typescript
      await client.webhooks.create({
          url: "https://<your-ngrok-url>.ngrok-free.app/webhooks",
      });
      ```
    </CodeBlocks>
  </Step>

  <Step title="3. AgentMail Sends Events">
    When a new message is received in one of your inboxes, AgentMail will immediately send a `POST` request with a JSON payload to your registered URL.
  </Step>
</Steps>

## Payload Structure

When AgentMail sends a webhook, the payload will have the following structure.

```json Webhook Payload
{
  "event_type": "message.received",
  "event_id": "evt_123abc...",
  "message": {
    "from_": ["sender@example.com"],
    "organization_id": "org_abc123...",
    "inbox_id": "inbox_def456...",
    "thread_id": "thd_ghi789...",
    "message_id": "msg_jkl012...",
    "labels": ["received"],
    "timestamp": "2023-10-27T10:00:00Z",
    "reply_to": ["reply-to@example.com"],
    "to": ["recipient@example.com"],
    "cc": ["cc-recipient@example.com"],
    "bcc": ["bcc-recipient@example.com"],
    "subject": "Email Subject",
    "preview": "A short preview of the email text...",
    "text": "The full text body of the email.",
    "html": "<html>...</html>",
    "attachments": [
      {
        "attachment_id": "att_pqr678...",
        "filename": "document.pdf",
        "content_type": "application/pdf",
        "size": 123456,
        "inline": false
      }
    ],
    "in_reply_to": "msg_parent456...",
    "references": ["msg_ref1...", "msg_ref2..."],
    "sort_key": "some-sort-key",
    "updated_at": "2023-10-27T10:00:05Z",
    "created_at": "2023-10-27T10:00:00Z"
  }
}
```

### Field Descriptions

* **`event_type`** (`string`): The name of the event. Currently, this will always be `message.received`.
* **`event_id`** (`string`): A unique identifier for this specific event delivery.
* **`message`** (`object`): A dictionary containing the full details of the received email message.
  * **`from_`** (`array<string>`): The sender's email address. Note the trailing underscore to avoid conflict with the Python keyword.
  * **`organization_id`** (`string`): The ID of your organization.
  * **`inbox_id`** (`string`): The ID of the inbox that received the message.
  * **`thread_id`** (`string`): The ID of the conversation thread.
  * **`message_id`** (`string`): The unique ID of this specific message.
  * **`labels`** (`array<string>`): Labels associated with the message (e.g., `received`, `sent`).
  * **`subject`** (`string`): The subject line of the email.
  * **`preview`** (`string`): A short plain-text preview of the email body.
  * **`text`** (`string`): The full plain-text body of the email.
  * **`html`** (`string`): The full HTML body of the email, if present.
  * **`attachments`** (`array<object>`): A list of attachments, each with its own `attachment_id`, `filename`, `content_type`, `size`, and `inline` status.
  * **`in_reply_to`** (`string`): The `message_id` of the email this message is a reply to, if applicable.

## Next Steps

<CardGroup>
  <Card title="Webhook Events" href="/events">
    Explore the full list of available event types and their data payloads.
  </Card>

  <Card title="Example: Event-Driven Agent" href="/github-star-agent">
    Build a fully deployable, event-driven agent that can respond to emails in
    real time.
  </Card>
</CardGroup>


# Webhook Events

> A complete reference of the AgentMail webhook event and its payload.

When you create a webhook, you subscribe to events from AgentMail. As of now, AgentMail supports a single event type: `message.received`. This event is your primary trigger for all agent-based workflows. We will be adding more event types in the future.

All webhook payloads follow the same basic structure:

```json
{
  "event": "event.name",
  "data": {
    // ... event-specific data object
  }
}
```

## Message Event

The `message.received` event is triggered whenever a new email is successfully received and processed in one of your `Inboxes`.

### `message.received`

* **Description:** This is the main trigger to kick off your agent's workflow. Use this event to fetch the full message content, process it, and decide on the next action, such as generating a reply.
* **Use Case:** Instantly kick off an agent's workflow to process and reply to an incoming email.

<CodeGroup>
  ```json
  {
    "event": "message.received",
    "data": {
      "id": "msg_123abc",
      "object": "message",
      "inbox_id": "inbox_456def",
      "thread_id": "thd_789ghi",
      "from": [
        {
          "name": "Jane Doe",
          "email": "jane@example.com"
        }
      ],
      "to": [
        {
          "name": "Support Agent",
          "email": "support@agentmail.to"
        }
      ],
      "subject": "Question about my account",
      "created_at": "2023-10-27T10:00:00Z"
      // ... and other message properties
    }
  }
  ```
</CodeGroup>

## Future Events

We are working on expanding our event offerings. In the future, you can expect to see events related to email delivery status, such as:

* `delivery.success`
* `delivery.bounced`
* `delivery.complained`
* and much more...

Stay tuned for updates as we roll out these new features!

If you have any specific webhook notifications you would like, please ping us in the `#feature-requests` channel in the [Discord](https://discord.gg/hTYatWYWBc)

```
```


# Email Deliverability

> Learn the strategies and best practices for maximizing your email deliverability with AgentMail.

## What is Email Deliverability?

Email deliverability is the art and science of getting your emails into your recipients' inboxes. It's not just about hitting "send"; it's about building a good reputation with email providers like Gmail and Outlook so they trust that you're sending valuable content, not spam.

High deliverability is the key to successful email automation. This guide will walk you through the best practices for both your sending strategy and your email content.

### The Technical Foundation: SPF, DKIM, DMARC

Before you send your first email, it's important to have the right technical foundation in place. SPF, DKIM, and DMARC are DNS records that act as a digital signature, proving to email providers that you are who you say you are.

<Tip>
  We take care of all of this for you guys, so no need to worry about these.
  Just something to know about(or google).
</Tip>

For maximum control and the best deliverability, we strongly recommend using your own custom domains. Setting these records up correctly on your own domain is the single most important step you can take.

<CardGroup>
  <Card title="Guide: Managing Custom Domains" icon="fa-solid fa-shield-alt" href="/custom-domains">
    Learn how to add your own domain and configure SPF, DKIM, and DMARC records.
  </Card>
</CardGroup>

## High-Volume Sending Strategy

How you send your emails is just as important as what you send. If you're sending a large volume of emails, follow these steps to build and maintain a strong sender reputation.

<Steps>
  <Step title="Warm-Up Your Inboxes">
    Don't go from zero to one thousand emails overnight. Email providers get
    suspicious of new inboxes that immediately send a high volume. Start slow
    and gradually increase your sending volume over several days or weeks. This
    "warm-up" process signals that you're a legitimate sender.

    <Callout intent="info">
      **Example Warm-Up Schedule:**
      <br /> - Day 1: 10 emails/inbox
      <br /> - Day 2: 20 emails/inbox
      <br /> - Day 3: 40 emails/inbox
      <br /> - ...and so on.
    </Callout>
  </Step>

  <Step title="Diversify Your Sending Inboxes">
    Instead of sending 10,000 emails from a single inbox, it's far better to
    send 100 emails from 100 different inboxes. This distributes your sending
    volume, reduces the risk of any single inbox getting flagged, and looks much
    more natural to email providers. AgentMail's ability to create inboxes at
    scale makes this strategy easy to implement.

    <img src="file:5e5404f2-b7c8-4fd9-ba5b-0741b39cc05e" alt="Diagram comparing one inbox sending 1000 emails vs. five inboxes sending 200 each." />
  </Step>

  <Step title="Protect Your Reputation with Multiple Domains">
    An email domain's reputation is its most valuable asset. To protect it, use
    multiple custom domains for your outreach campaigns. If one domain's
    reputation is inadvertently damaged, you can cycle it out without impacting
    the deliverability of your other domains.
  </Step>
</Steps>

## High-Impact Content Strategy

The content of your email plays a huge role in whether it's seen as a valuable message or as spam.

<Steps>
  <Step title="Personalize Everything">
    Address your recipients by name in the subject line and email body. Use
    other data points you have to make the email feel like a one-to-one
    conversation, not a mass blast. Generic emails are a major red flag for spam
    filters.
  </Step>

  <Step title="Write Like a Human, Not a Marketer">
    Avoid "spammy" keywords (e.g., "free," "buy now," "limited time offer"),
    excessive exclamation points, and using all caps. Write in a natural,
    conversational tone. The goal is to start a conversation, not to close a
    sale in the first email.
  </Step>

  <Step title="Be Strategic with images">
    Any type of image that isn't an attachment but included in the message body
    actually sets of the spam alarms. Don't do it. Also get rid of your
    open-tracker while your at it because how EVERY service checks if the
    reciepeint of your email opened your message is by encoding a small image
    into the body. Hurts deliverability!!
  </Step>

  <Step title="CTA Selection">
    Email providers are wary of emails links, especially in the first message of
    a conversation. A great strategy is to send your initial outreach with no
    links or images. Wait for the recipient to reply, and *then* send your
    call-to-action (CTA) link. This behavior is viewed far more favorably, as
    it's now viewd as a "conversation."
  </Step>

  <Step title="HTML + Text">
    Email providers oftentimes flag emails that only include HTML as spam.
    Providing a plain text alternative demonstrates the legitimacy of your
    message to providers like Gmail and increases the chances of it reaching the
    recipient's inbox.
  </Step>
</Steps>


# Idempotent Requests

> A guide to using the client_id parameter in AgentMail to prevent duplicate resources and safely retry API requests.

## What is Idempotency?

In the context of an API, idempotency is the concept that making the same API request multiple times produces the same result as making it just once. If an idempotent `POST` request to create a resource is sent five times, it only creates the resource on the first call. The next four calls do nothing but return the result of that first successful call.

This is a critical feature for building robust, fault-tolerant systems. Network errors, timeouts, and client-side retries are inevitable. Without idempotency, these events could lead to unwanted duplicate resources, like creating multiple identical inboxes or webhooks.

## How AgentMail Handles Idempotency

AgentMail supports idempotency for all `create` operations via an optional `client_id` parameter.

When you provide a `client_id` with a `create` request, AgentMail checks if a request with that same `client_id` has already been successfully completed.

* **If it's the first time** we've seen this `client_id`, we process the request as normal, create the resource, and store the resulting resource `id` against your `client_id`.
* **If we have seen this `client_id` before**, we do *not* re-process the request. Instead, we immediately return a `200 OK` response with the data from the *original*, successfully completed request.

This allows you to safely retry requests without the risk of creating duplicate data.

```python
# The first time this code is run, it creates a new inbox.
inbox = client.inboxes.create(
    username="idempotent-test",
    client_id="user-123-inbox-primary"
)
print(f"Created inbox: {inbox.id}")

# If you run this exact same code again, it will NOT create a second
# inbox. It will return the same inbox object from the first call.
inbox_again = client.inboxes.create(
    username="idempotent-test",
    client_id="user-123-inbox-primary"
)
print(f"Retrieved same inbox: {inbox_again.id}")
# The inbox.id will be identical in both calls.
```

## Best Practices for `client_id`

To use idempotency effectively, the `client_id` you generate must be unique and deterministic.

* **Deterministic:** The same logical resource on your end should always generate the same `client_id`. For example, a `client_id` for a user's primary inbox could be `inbox-for-user-{{USER_ID}}`.
* **Unique:** Do not reuse a `client_id` for creating different resources. A `client_id` used to create an inbox should not be used to create a webhook.

A common and highly effective pattern is to generate a UUID (like a `UUID v4`) on your client side for a resource you are about to create, save that UUID in your own database, and then use it as the `client_id` in the API call. This gives you a reliable key to use for any retries.


# Example: Event-Driven Agent

> A step-by-step guide to building a sophisticated agent that performs proactive outreach and uses webhooks for inbound message processing.

This tutorial walks you through building a sophisticated, dual-mode agent. It will:

1. **Proactively monitor** a GitHub repository and send an outreach email when it detects a new "star".
2. **Reactively process** and reply to incoming emails in real-time using AgentMail Webhooks.

We will use Flask to create a simple web server and `ngrok` to expose it to the internet so AgentMail can send it events.

## Prerequisites

Before you start, make sure you have the following:

* Python 3.8+
* An [AgentMail API Key](mailto:contact@agentmail.to).
* An [OpenAI account](https://openai.com/) and API key.
* An [ngrok account](https://ngrok.com/) and authtoken.

## Step 1: Project Setup

First, let's set up your project directory and install the necessary dependencies.

1. **Create a project folder** and navigate into it.

2. **Create a `requirements.txt` file** with the following content:

   ```txt
   agentmail
   agentmail-toolkit
   openai
   openai-agents
   python-dotenv
   flask
   ngrok
   ```

3. **Install the packages:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file** to store your secret keys and configuration.

   ```env
   AGENTMAIL_API_KEY="your_agentmail_api_key"
   OPENAI_API_KEY="your_openai_api_key"

   NGROK_AUTHTOKEN="your_ngrok_authtoken"
   INBOX_USERNAME="github-star-agent"
   WEBHOOK_DOMAIN="your-ngrok-subdomain.ngrok-free.app"
   DEMO_TARGET_EMAIL="your-email@example.com"
   TARGET_GITHUB_REPO="YourGitHub/YourRepo"
   ```

   * Replace the placeholder values with your actual keys.
   * `WEBHOOK_DOMAIN` is your custom domain from your ngrok dashboard.
   * `INBOX_USERNAME` will be the email address for your agent (e.g., `github-star-agent@agentmail.to`).

## Step 2: The Agent Code (`main.py`)

Create a file named `main.py` and add the full code example you provided. This script contains all the logic for our agent, including the new logic to idempotently create the inbox it needs.

<CodeBlocks>
  ````python main.py
  from dotenv import load_dotenv
  load_dotenv()

  import os
  import asyncio
  from threading import Thread
  import time

  import ngrok
  from flask import Flask, request, Response

  from agentmail import AgentMail
  from agentmail_toolkit.openai import AgentMailToolkit
  from agents import WebSearchTool, Agent, Runner

  port = 8080
  domain = os.getenv("WEBHOOK_DOMAIN")
  inbox_username = os.getenv("INBOX_USERNAME")
  inbox = f"{inbox_username}@agentmail.to"

  target_github_repo = os.getenv("TARGET_GITHUB_REPO")
  if not target_github_repo:
  print("\nWARNING: The TARGET_GITHUB_REPO environment variable is not set.")
  print("The agent will not have a specific GitHub repository to focus on.")
  print("Please set it in your .env file (e.g., TARGET_GITHUB_REPO='owner/repository_name')\n")

  demo_target_email = os.getenv("DEMO_TARGET_EMAIL")
  if not demo_target_email:
  print("\nWARNING: The DEMO_TARGET_EMAIL environment variable is not set.")
  print("The agent will not have a specific email to send the 'top starrer' outreach to.")
  print("Please set it in your .env file (e.g., DEMO_TARGET_EMAIL='your.email@example.com')\n")

  # Determine the target email, with a fallback if the environment variable is not set.

  # The fallback is less ideal for a real demo but prevents the agent from having no target.

  actual_demo_target_email = demo_target_email if demo_target_email else "fallback.email@example.com"

  # Use a fallback for target_github_repo as well for the instructions string construction

  actual_target_github_repo = target_github_repo if target_github_repo else "example/repo"

  # --- AgentMail and Web Server Setup ---

  # 1. Initialize the AgentMail client

  client = AgentMail()

  # 2. Idempotently create the inbox for the agent

  # Using a deterministic client_id ensures we don't create duplicate inboxes

  # if the script is run multiple times.

  inbox_client_id = f"inbox-for-{inbox_username}"
  print(f"Attempting to create or retrieve inbox '{inbox}' with client_id: {inbox_client_id}")
  try:
  client.inboxes.create(
  username=inbox_username,
  client_id=inbox_client_id
  )
  print("Inbox creation/retrieval successful.")
  except Exception as e:
  print(f"Error creating/retrieving inbox: {e}") # Depending on the desired behavior, you might want to exit here # if the inbox is critical for the agent's function.

  # 3. Start the ngrok tunnel to get a public URL

  print("Starting ngrok tunnel...")
  listener = ngrok.forward(port, domain=domain, authtoken_from_env=True)
  print(f"ngrok tunnel started: {listener.url()}")

  # 4. Idempotently create the webhook pointing to our new public URL

  webhook_url = f"{listener.url()}/webhooks"
  webhook_client_id = f"webhook-for-{inbox_username}"
  print(f"Attempting to create or retrieve webhook for URL: {webhook_url}")
  try:
  client.webhooks.create(
  url=webhook_url,
  client_id=webhook_client_id,
  )
  print("Webhook creation/retrieval successful.")
  except Exception as e:
  print(f"Error creating/retrieving webhook: {e}")

  # 5. Initialize the Flask App

  app = Flask(**name**)

  instructions = f"""
  You are a GitHub Repository Evangelist Agent. Your name is AgentMail. Your email address is {inbox}.
  Your primary focus is the GitHub repository: '{actual_target_github_repo}'.
  Your goal is to engage the user at {actual_demo_target_email} about the potential of '{actual_target_github_repo}' for building AI agents, using rich HTML emails.

  **You operate in two main scenarios:**

  **Scenario 1: Proactive Outreach (Triggered by internal monitor for '{actual_target_github_repo}')**

  - You will receive a direct instruction when a new (simulated) star is detected for '{actual_target_github_repo}'.
  - This instruction will explicitly ask you to:
    1.  Use the WebSearchTool to find fresh, compelling information or talking points about '{actual_target_github_repo}' (e.g., new features, use cases for agent development, benefits). You should synthesize this information, not just copy it.
    2.  Use the 'send_message' tool to send a NEW email to {actual_demo_target_email}.
        - The email should start by mentioning something like: "Hello! We noticed you recently showed interest in (or starred) our repository, '{actual_target_github_repo}'! We're excited to share some insights..."
        - You must craft an engaging 'subject' for this email.
        - You must craft an informative 'html' (body) for this email in HTML format, based on your synthesized web search findings. **Do NOT include raw URLs or direct links from your web search in the email body.** Instead, discuss the concepts or information you found.
        - The email must end with a clear call to action inviting the user to ask you (the agent) questions. For example: "I'm an AI assistant for '{actual_target_github_repo}', ready to answer any questions you might have. Feel free to reply to this email with your thoughts or queries!"
  - Your final output for THIS SCENARIO (after the send_message tool call) should be a brief confirmation message (e.g., "Proactive HTML email about new star sent to {actual_demo_target_email}."). Do NOT output the email content itself as your final response here, as the tool handles sending it.

  **Scenario 2: Replying to Emails (Triggered by webhook when an email arrives at {inbox})**

  - You will receive the content of an incoming email (From, Subject, Body).
  - **If the email is FROM '{actual_demo_target_email}':**
    - This is a reply from your primary contact. Your goal is to continue the conversation naturally and persuasively. **Your entire output for this interaction MUST be a single, well-formed HTML string for the email body. It must start directly with an HTML tag (e.g., `<p>`) and end with a closing HTML tag. Do NOT include any other text, labels, comments, or markdown-style code fences (like `html ... ` or '''html: ...''') before or after the HTML content itself.**
    - Use the WebSearchTool to find relevant new information about '{actual_target_github_repo}' to answer their questions, address their points, or further highlight the repository's value for agent development.
    - **Strict Conciseness for Guides/Steps:** If the user asks for instructions, a guide, or steps (e.g., "how to install", "integration guide", "how to use X feature"), your reply MUST be **extremely concise (max 2-3 sentences summarizing the core idea)** and provide **ONE primary HTML hyperlink** to the most relevant page in the official documentation (e.g., `https://docs.agentstack.sh`). **Absolutely do NOT list multiple steps, commands, or code snippets in the email for these types of requests.** Your goal is to direct them to the documentation for details.
    - **HTML Formatting for All Replies:**
      - Use `<p>` tags for paragraphs. Avoid empty `<p></p>` tags or excessive `<br />` tags to prevent unwanted spacing.
      - For emphasis, use `<strong>` or `<em>`.
      - If, for a question _not_ about general guides/steps, a short code snippet is essential for a direct answer, you MUST wrap it in `<pre><code>...code...</code></pre>` tags. But avoid this for guide-type questions.
      - All URLs you intend to be clickable MUST be formatted as HTML hyperlinks: `<a href="URL\">Clickable Link Text</a>`. Do not output raw URLs or markdown-style links.
      - For example, a reply to "how to install" MUST be similar to: `<p>You can install AgentStack using package managers like Homebrew or pipx. For the detailed commands and options, please consult our official <a href='https://docs.agentstack.sh/installation'>Installation Guide</a>.</p><p>Is there anything else specific I can help you find in the docs or a different question perhaps?</p>`
    - The webhook handler will use your **raw string output** directly as the HTML body of the reply.
  - **If the email is FROM ANY OTHER ADDRESS:**
    - This is unexpected. Politely state (in simple HTML, using one or two `<p>` tags, **and no surrounding fences or labels**) that you are an automated agent focused on discussing '{actual_target_github_repo}' with {actual_demo_target_email} and cannot assist with other requests at this time.
    - Your output for this interaction should be ONLY this polite, **raw HTML email body.**

  **General Guidelines for HTML Emails to {actual_demo_target_email}:**
  _ Always be enthusiastic and informative about '{actual_target_github_repo}'.
  _ Tailor your points based on information you find with the WebSearchTool. For initial outreach, synthesize information. **For replies asking for guides/steps, BE EXTREMELY CONCISE, summarize in 2-3 sentences, and provide a single link to the main documentation.**
  _ Initial outreach: concise (5-6 sentences). Replies answering specific, non-guide questions: aim for 7-10 sentences. **Replies to guide/installation/integration questions: MAX 4 sentences, including the link.**
  _ Structure ALL content with appropriate HTML tags: `<p>`, `<br />` (sparingly), `<strong>`, `<em>`, `<u>`, `<ul>`, `<ol>`, `<li>` (if not a guide question), `<pre><code>` (if not a guide question and essential), and **`<a href="URL">link text</a>` for ALL clickable links.** NO MARKDOWN-STYLE LINKS.

  - \*\*IMPORTANT: Your output for replies (Scenario 2, when email is from {actual*demo_target_email}) MUST be \_only* the HTML content itself. Do not wrap it in markdown code fences (like ```html), or any other prefix/suffix text.** Start directly with `<p>` or another HTML tag.
  - Encourage interaction. The initial email must end with an invitation to reply with questions. \* Maintain conversation context.

  Remember, your primary contact for ongoing conversation is '{actual_demo_target_email}', and your primary topic is always '{actual_target_github_repo}'.
  """

  agent = Agent(
  name="GitHub Agent",
  instructions=instructions,
  tools=AgentMailToolkit(client).get_tools() + [WebSearchTool()],
  )

  messages = []

  # --- GitHub Polling Logic ---

  simulated_stargazer_count = 0
  MAX_SIMULATED_STARS = 1 # single star even
  stars_found_so_far = 0

  def poll_github_stargazers():
  global simulated_stargazer_count, stars_found_so_far
  print(f"GitHub polling thread started for top 20 repositories related to AI agents...")

      # Give the Flask app a moment to start up if run concurrently
      time.sleep(3)

      while stars_found_so_far < MAX_SIMULATED_STARS:
          time.sleep(13) # Poll every 30 seconds for the demo

          # Simulate a new star appearing
          new_star_detected = False
          # For demo, let's just add a star each time for the first few polls
          if stars_found_so_far < MAX_SIMULATED_STARS: # Check again inside loop
              simulated_stargazer_count += 1
              stars_found_so_far += 1
              new_star_detected = True
              print(f"[POLLER] New star! Total: {simulated_stargazer_count}")

          if new_star_detected and actual_target_github_repo != "example/repo" and actual_demo_target_email != "fallback.email@example.com":
              prompt_for_agent = f"""\
              URGENT TASK: A new star has been detected for the repository '{actual_target_github_repo}' (simulated count: {simulated_stargazer_count}).
              Your goal is to use the 'send_message' tool to notify {actual_demo_target_email} with an HTML email that does not contain direct web links in its body and has a specific call to action.

              Thought: I need to perform two steps: first, gather information using WebSearchTool, and second, synthesize this information into an HTML email and send it using the send_message tool.

              Step 1: Gather Information.
              Use the WebSearchTool to find ONE fresh, compelling piece of information or talking point about '{actual_target_github_repo}' relevant to AI agent development.
              Your output for this step should be an action call to WebSearchTool. For example:
              Action: WebSearchTool("key features of {actual_target_github_repo} for AI agents")

              (After you receive the observation from WebSearchTool, you will proceed to Step 2 in your next turn)

              Step 2: Formulate and Send HTML Email.
              Based on the information from WebSearchTool, you MUST call the 'send_message' tool.
              The email should start by acknowledging the user's interest, e.g., "<p>Hello! We noticed you recently showed interest in (or starred) our repository, <strong>{actual_target_github_repo}</strong>! We're excited to share some insights...</p>"
              The email body should discuss the information you found but **MUST NOT include any raw URLs or direct hyperlinks from the web search results.** Synthesize the information.
              The email MUST end with a call to action like: "<p>I'm an AI assistant for '{actual_target_github_repo}', and I'm here to help answer any questions you might have. Feel free to reply to this email with your thoughts or if there's anything specific you'd like to know!</p>"

              The parameters for the 'send_message' tool call should be:
                 - 'to': ['{actual_demo_target_email}']
                 - 'inbox_id': '{inbox}'
                 - 'subject': An engaging subject based on the web search findings (e.g., "Insights on {actual_target_github_repo} for Your AI Projects!").
                 - 'html': An email body in HTML format, adhering to all the above content and formatting rules (mention star, no direct links, specific CTA).

              Your output for this step MUST be an action call to 'send_message' with the tool input formatted as a valid JSON string, ensuring you use the 'html' field for the body. For example:
              Action: send_message(```json
              {{
                "inbox_id": "{inbox}",
                "to": ["{actual_demo_target_email}"],
                "subject": "Following Up on Your Interest in {actual_target_github_repo}!",
                "html": "<p>Hello! We noticed you recently showed interest in <strong>{actual_target_github_repo}</strong>!</p><p>We've been developing some exciting capabilities within it, particularly around [synthesized information from web search, e.g., its new modular design for agent development]. This allows for more flexible integration of AI components.</p><p>I'm an AI assistant for \'{actual_target_github_repo}\', and I\'m here to help answer any questions you might have. Feel free to reply to this email with your thoughts or if there\'s anything specific you\'d like to know!</p>"
              }}
              ```)

              If you cannot find information with WebSearchTool in Step 1, for Step 2 you should still attempt to call send_message. The HTML email should still acknowledge the star and provide the specified CTA, but state that fresh specific updates couldn't be retrieved at this moment, while still highlighting the general value of '{actual_target_github_repo}'.
              Your final conversational output after the 'send_message' action is executed by the system should be a simple confirmation like "Email dispatch initiated to {actual_demo_target_email}."
              """
              print(f"[POLLER] Triggering agent for new star on {actual_target_github_repo} to notify {actual_demo_target_email}")
              # We run the agent in a blocking way here for simplicity in the polling thread.
              # The 'messages' history is intentionally kept separate from the webhook's conversation history for this proactive outreach.
              try:
                  response = asyncio.run(Runner.run(agent, [{"role": "user", "content": prompt_for_agent}]))
                  print(f"[POLLER] Agent response to new star prompt: {response.final_output}")
                  # You could add a more specific check here if the agent is supposed to return a structured success/failure
                  if "email dispatch initiated" not in response.final_output.lower():
                      print(f"[POLLER_WARNING] Agent response did not explicitly confirm email sending according to expected pattern: {response.final_output}")
              except Exception as e:
                  print(f"[POLLER_ERROR] An error occurred while the agent was processing the new star prompt: {e}")
                  import traceback # Import traceback here to use it
                  print(f"[POLLER_ERROR] Traceback: {traceback.format_exc()}")
          elif new_star_detected:
              print("[POLLER] Simulated new star, but TARGET_GITHUB_REPO or DEMO_TARGET_EMAIL is not properly set. Skipping agent trigger.")

  @app.route("/webhooks", methods=["POST"])
  def receive_webhook():
  print(f"\n[/webhooks] Received webhook. Payload keys: {list(request.json.keys()) if request.is_json else 'Not JSON or empty'}")
  Thread(target=process_webhook, args=(request.json,)).start()
  return Response(status=200)

  def process_webhook(payload):
  global messages

      email = payload["message"]
      print(f"[process_webhook] Processing email from: {email.get('from')}, subject: {email.get('subject')}, id: {email.get('message_id')}")

      prompt = f"""

  From: {email["from"]}
  Subject: {email["subject"]}
  Body:\n{email["text"]}
  """
  print("Prompt:\n\n", prompt, "\n")

      response = asyncio.run(Runner.run(agent, messages + [{"role": "user", "content": prompt}]))
      print("Response:\n\n", response.final_output, "\n")

      print(f"[process_webhook] Attempting to send reply to message_id: {email['message_id']} via inbox: {inbox}")
      client.messages.reply(inbox_id=inbox, message_id=email["message_id"], html=response.final_output)
      print(f"[process_webhook] Reply call made for message_id: {email['message_id']}.")

      messages = response.to_input_list()
      print(f"[process_webhook] Updated message history. New length: {len(messages)}\n")

  if **name** == "**main**":
  print(f"Inbox: {inbox}\n")
  if not target_github_repo or target_github_repo == "example/repo":
  print("WARNING: TARGET_GITHUB_REPO not set or is default. Poller will not be effective.")
  if not demo_target_email:
  print("WARNING: DEMO_TARGET_EMAIL not set or is default. Poller will not be effective.")

      polling_thread = Thread(target=poll_github_stargazers)
      polling_thread.daemon = True # So it exits when the main thread exits
      polling_thread.start()

      print(f"ngrok tunnel started: {listener.url()}")

      app.run(port=port)

  ````
</CodeBlocks>

### Understanding the Code

<AccordionGroup>
  <Accordion title="Idempotency with `client_id`">
    Notice that the script now handles its own setup. Before the agent starts, the code calls `client.inboxes.create` with a `client_id` parameter. This makes the operation **idempotent**.

    The first time you run the script, it creates the inbox. Every subsequent time, the AgentMail API will recognize the `client_id`, see that the inbox already exists, and simply return the existing inbox's data instead of creating a duplicate. This makes your script robust and safe to run multiple times. The same principle is used when creating the webhook.
  </Accordion>

  <Accordion title="Agent Persona and Instructions">
    The `instructions` variable defines the agent's entire personality, goals, and operational logic. It's a comprehensive prompt that tells the agent how to behave in two distinct scenarios: proactive outreach for new GitHub stars and reactive replies to incoming emails. It includes strict rules on HTML formatting and how to handle different types of user queries.
  </Accordion>

  <Accordion title="Proactive Polling (`poll_github_stargazers`)">
    This function runs in a separate background thread. For this demo, it *simulates* finding a new star on your target repository every 13 seconds. When it "finds" one, it constructs a detailed prompt and calls the agent to begin the outreach workflow (search for info, then send an email).

    <Callout type="info" title="This is a Simulation">
      To keep the example focused, this code does not actually connect to the GitHub API. It simulates finding a new star to trigger the agent. In a real-world application, you would replace the simulation logic inside this function with actual API calls to GitHub to get real data.
    </Callout>
  </Accordion>

  <Accordion title="Webhook Server (`Flask` and `ngrok`)">
    * `app = Flask(__name__)` creates our web server.
    * `@app.route("/webhooks", methods=["POST"])` defines the specific URL that will listen for `POST` requests from AgentMail.
    * `listener = ngrok.forward(...)` tells `ngrok` to create a public URL (using your `WEBHOOK_DOMAIN`) and securely forward all traffic to our local Flask server on port `8080`.
  </Accordion>

  <Accordion title="Webhook Processing (`process_webhook`)">
    When a request hits our `/webhooks` endpoint, the `receive_webhook` function immediately starts the `process_webhook` function in a new thread. This is a crucial best practice: it allows us to return a `200 OK` status to AgentMail instantly while the heavy lifting happens in the background.

    Inside `process_webhook`, the function parses the JSON payload, constructs a prompt from the email's content, runs the agent, and then uses `client.messages.reply()` to send the agent's HTML output as a reply.
  </Accordion>
</AccordionGroup>

## Step 3: Run the Agent

Now, let's bring your agent to life. The script is now fully self-contained. When you run it, it will automatically:

1. Create the agent's inbox.
2. Start an `ngrok` tunnel to get a public URL.
3. Use that URL to create the AgentMail webhook.
4. Start the web server to listen for events.
5. Start the background process to monitor GitHub.

Open your terminal in the project directory and run the command:

```bash
python main.py
```

You should see a series of logs confirming that all setup steps have been completed. Keep this terminal window running.

## Step 4: Test Your Agent

### Test Scenario 1: Proactive Outreach

You don't have to do anything for this one! The `poll_github_stargazers` function is already running. Within about 15 seconds, you should see logs in your terminal indicating that a new star was detected and the agent is being triggered. A few moments later, an email should arrive in the inbox you specified for `DEMO_TARGET_EMAIL`.

### Test Scenario 2: Reactive Reply

1. Find the email your agent just sent you.
2. Reply to it with a question, like "This is cool! How do I install it?"
3. Check your running `main.py` terminal. You should see new logs indicating a webhook was received and is being processed.
4. Shortly after, you should receive an HTML-formatted email reply from your agent in your inbox.

You now have a fully event-driven agent that can both initiate conversations and respond to them in real time!

```
```


# Live AgentMail Examples

# Live Email Agents

We have several deployed agents running in production that demonstrate the power of AgentMail. These agents showcase different use cases and capabilities of our platform.

<Steps>
  <Step title="Connector Agent: connect@agentmail.to">
    <p>
      Our Connector Agent specializes in building relationships and networking through email.
      It can analyze email content, identify key contacts, and automatically follow up with
      personalized messages to strengthen professional connections.
    </p>

    <div>
      <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7356006982559936512?compact=1" height="399" width="504" frameborder="0" allowfullscreen="" title="Embedded post" />
    </div>
  </Step>

  <Step title="Hiring Agent: hiring@agentmail.to">
    <p>
      The Hiring Agent streamlines recruitment processes by automatically
      screening candidates, scheduling interviews, and managing communication
      throughout the hiring pipeline. It reduces manual work and ensures no
      promising candidates fall through the cracks.
    </p>

    <div>
      <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7361454978672070660?compact=1" height="399" width="504" frameborder="0" allowfullscreen="" title="Embedded post" />
    </div>
  </Step>
</Steps>

## Get Started

Ready to build your own intelligent email agent? Check out our [quickstart guide](/get-started/quickstart) or explore the [API reference](/api-reference) to see what's possible.

<Note>
  These agents are running in production and handling real email communications.
  Want to see them in action? [Contact us](mailto:contact@agentmail.cc) for a
  demo.
</Note>


# Frequently Asked Questions (FAQ)

> Find answers to common questions about AgentMail, from core concepts to best practices and security.

<AccordionGroup>
  <Accordion title="What is AgentMail?">
    AgentMail is an API-first email platform designed specifically for building
    AI agents that can communicate over email. While traditional email APIs are
    built for sending one-way notifications, AgentMail is built for two-way
    conversations, making it easy to create agents that can read, understand,
    and reply to emails in a thread, just like a human would.
  </Accordion>

  <Accordion title="How is AgentMail different from services like SendGrid or Mailgun?">
    The key difference is our focus on **conversational agents**. Services like
    SendGrid are excellent for transactional emails (receipts, password resets)
    and marketing campaigns. These are done via a GUI. Resend is an API that is
    great to do those transactional emails as well. BUT AgentMail is built for
    the unique challenges allowing agents to have 2-way conversation over email,
    with first-class support for concepts like `Threads`, `Inboxes`, and
    `Attachments` to manage complex, stateful conversations over email.
  </Accordion>

  <Accordion title="Can I use my own custom domain to send emails?">
    Yes, absolutely! While you can get started instantly with an `@agentmail.to`
    inbox, we highly recommend setting up your own custom domain for production
    use. This improves deliverability and ensures emails come from your brand.
    You can find a complete guide [here](/custom-domains).
  </Accordion>

  <Accordion title="What's the best way to process incoming emails?">
    For production applications, **Webhooks are the recommended method**. They
    provide real-time notifications and are far more efficient than constantly
    polling the API for new messages. You can learn how to set them up in our
    [Webhooks Overview](/overview).
  </Accordion>

  <Accordion title="How do I make sure I don't end up in spam?">
    Email deliverability is a complex topic. We go in depth in our [Email
    Deliverability best practices guide](/email-deliverability).
  </Accordion>

  <Accordion title="Do you have SDKs available?">
    Yes! We currently offer official SDKs for Node.js/TypeScript and Python to
    make integrating with AgentMail as easy as possible. You can find links and
    information in our [API reference](/api-reference).
  </Accordion>
</AccordionGroup>


# Join the AgentMail Community

> Connect with the AgentMail team and developers, share what you're building, and get support.

<CardGroup>
  <Card title="Join our Discord Server" href="https://discord.gg/your-invite-code" icon="fa-brands fa-discord">
    The best place for real-time conversation, getting help with your code, and
    sharing what you're building with AgentMail.
  </Card>

  <Card title="Follow us on X (Twitter)" href="https://twitter.com/agentmail_to" icon="fa-brands fa-x-twitter">
    Stay up-to-date with the latest product announcements, community highlights,
    and tips for building better agents.
  </Card>

  <Card title="Connect on LinkedIn" href="https://linkedin.com/company/agentmailto" icon="fa-brands fa-linkedin">
    Follow our company page for official updates, industry insights, and
    professional networking with the team.
  </Card>
</CardGroup>

<Callout title="Premium Support for Customers" intent="info" icon="fa-brands fa-slack">
  For purchasing customers, we offer dedicated support channels to ensure your success. Get priority assistance, custom integration help, and a private Slack channel with our core engineering team.

  To learn more about our premium plans and dedicated support options, please email us at [contact@agentmail.to](mailto:contact@agentmail.to).
</Callout>


# Support

## Need Help?

<Cards>
  <Card title="GitHub Issues" icon="fa-brands fa-github" href="https://github.com/agentmail-to" />

  <Card title="Discord Community" icon="fa-brands fa-discord" href="https://discord.gg/ZYN7f7KPjS" />

  <Card title="Email Support" icon="fa-solid fa-envelope" href="mailto:support@agentmail.cc" />
</Cards>


# Understanding Email Authentication (SPF, DKIM, DMARC)

> Learn why we ask for DNS records and what SPF, DKIM, and DMARC are.

When you add a custom domain to AgentMail, we ask you to add several records to your DNS settings. We understand that this can seem daunting, and we want to be completely transparent about what these records are and why they are necessary.

In short, by adding these records, you are giving AgentMail **permission** to do two things:

1. **Send emails on your behalf** that are trusted and pass spam filters.
2. **Receive emails for you** so your agents can process them.

This process is standard practice for any third-party email service, and it does **not** give us control over your website or any other part of your domain. Let's break down what each piece does.

## The Pillars of Email Authentication

To prevent spam and phishing, the modern email ecosystem relies on three core technologies: **SPF**, **DKIM**, and **DMARC**. Our goal is to handle all the complexity of these protocols for you.

Your DNS records are simply the way you tell the world that you've authorized us to do so.

### SPF: Sender Policy Framework

* **What it is:** Think of SPF as a public list of all the servers that are allowed to send email for your domain.
* **How it works:** You add a `TXT` record to your DNS that lists the approved IP addresses or domains. When an email server receives a message from `you@your-domain.com`, it checks the SPF record for `your-domain.com`. If the server that sent the email is on that list, the check passes. This is what a record we give you might look like
* **Your Record:**
  ```text
  TXT | mail.domain.com | v=spf1 include:agentmail.com -all
  ```
  This record tells the world that we are an authorized sender for the `mail.domain.com` subdomain. The `-all` part suggests that any server *not* on this list should be considered unauthorized.

### DKIM: DomainKeys Identified Mail

* **What it is:** DKIM is like a digital signature for your emails. This signature proves two things: that the email actually came from your domain and that its content hasn't been messed with with in transit from you to who you are trying to send to.
* **How it works:** We generate a unique, secure key for your domain. When we send an email, we "sign" it with this key. The public part of that key is published in your DNS. Receiving servers use this public key to verify the signature.

These are a couple of records we might ask you to add.

* **Your Records:**
  ```text
  CNAME | b4w..._domainkey.payment... | b4w...dkim.agentmail.com
  CNAME | 32c..._domainkey.payment... | 32c...dkim.agentmail.com
  CNAME | xl4..._domainkey.payment... | xl4...dkim.agentmail.com
  ```
  Instead of having you publish the raw key (which can be messy and needs to be rotated), we use `CNAME` records. These records act as aliases, pointing a specific address on your domain to one managed by us. This allows us to manage the security of your signing keys automatically without you ever needing to change them.

### DMARC: Domain-based Message Authentication, Reporting, and Conformance

* **What it is:** DMARC is the policy that ties SPF and DKIM together. It tells receiving email servers what to do if an email claims to be from you but fails the SPF or DKIM checks(or both).
* **How it works:** You publish a `TXT` record that specifies your policy. You can tell servers to `reject` the message, quarantine it (mark as spam), or do nothing. It also allows you to get reports on which emails are passing and failing these checks.

We typically tell servers to reject the message as this increases deliverability(as you can see, this is something we've done our research on!)

* **Your Record:**
  ```text
  TXT | _dmarc.domain.com | v=DMARC1; p=reject; rua=mailto:dmarc@agentmail.to
  ```
  This policy tells servers to `reject` any email that fails authentication. The `rua` tag specifies that aggregate reports about these failures should be sent to `dmarc@agentmail.to`, allowing us to monitor your domain's health and deliverability on your behalf.

## Receiving Mail: The MX Records

Finally, to receive emails for your agents, you need to tell the internet where to deliver them. This is the job of the **MX (Mail Exchange)** records.

* **What they are:** MX records are the post office address for your domain's email.
* **How they work:** When someone sends an email to `your-agent@your-domain.com`, their mail server looks up the MX record for `your-domain.com` to find out where to send it.

This is some records that we might give you:

* **Your Records:**
  ```text
  MX | domain.com | 10 inbound-agentmail.com
  MX | mail.domain.com | 10 feedback-smtp.agentmail.com
  ```
  The first record directs all incoming mail for your domain to our servers, so we can ingest it and trigger your agents. The second `feedback-smtp` record is specifically for routing automated feedback, like bounce and complaint notifications from other mail servers, which is crucial for maintaining a healthy sender reputation.

We hope this provides a clear and transparent look into why these DNS records are required. By setting them up, you enable AgentMail to provide a secure and reliable email experience for your AI agents.


# SOC 2 Compliance

We're almost there....


# API Welcome

> Quick overview of the AgentMail SDK

## Introduction

AgentMail provides a powerful API for managing email communications programmatically. Whether you're building automated testing systems, handling customer support workflows, or developing email-based applications, our API offers the tools you need!

## Available SDKs

<Cards>
  {" "}

  <Card title="Python SDK" icon="fa-brands fa-python" href="https://github.com/agentmail-to/agentmail-python">
    Use our Python SDK for seamless integration with your Python applications.
  </Card>

  <Card title="Node SDK" icon="fa-brands fa-node-js" href="https://github.com/agentmail-to/agentmail-node">
    Use our Node SDK for seamless integration with your Node applications.
  </Card>
</Cards>

## Contribute

We welcome contributions to our SDKs. If you have any suggestions or improvements, please feel free to open a pull request!

If you have any other languages you would like us to support, please [reach out to us](mailto:support@agentmail.cc).

## License

All of our SDKs are open source and available under the MIT license.


# List Inboxes

GET https://api.agentmail.to/v0/inboxes

Reference: https://docs.agentmail.to/api-reference/inboxes/list

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.list({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.list()

```

# Get Inbox

GET https://api.agentmail.to/v0/inboxes/{inbox_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/get

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.get("inbox_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.get(
    inbox_id="inbox_id"
)

```

```shell
curl https://api.agentmail.to/v0/inboxes/:inbox_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.get(":inbox_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.get(
    inbox_id=":inbox_id"
)

```

# Create Inbox

POST https://api.agentmail.to/v0/inboxes
Content-Type: application/json

Reference: https://docs.agentmail.to/api-reference/inboxes/create

## Examples

```shell
curl -X POST https://api.agentmail.to/v0/inboxes \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.create({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.create()

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.create({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.create()

```

# Delete Inbox

DELETE https://api.agentmail.to/v0/inboxes/{inbox_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/delete

## Examples

```shell
curl -X DELETE https://api.agentmail.to/v0/inboxes/inbox_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.delete("inbox_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.delete(
    inbox_id="inbox_id"
)

```

```shell
curl -X DELETE https://api.agentmail.to/v0/inboxes/:inbox_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.delete(":inbox_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.delete(
    inbox_id=":inbox_id"
)

```

# List Threads

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/threads

Reference: https://docs.agentmail.to/api-reference/inboxes/threads/list

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/threads \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.threads.list("inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.threads.list(
    inbox_id="inbox_id"
)

```

```shell
curl -G https://api.agentmail.to/v0/inboxes/:inbox_id/threads \
     -H "Authorization: Bearer <api_key>" \
     -d limit=0 \
     -d page_token=string
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.threads.list(":inbox_id", {
        limit: 0,
        pageToken: "string",
    });
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.threads.list(
    inbox_id=":inbox_id",
    limit=0,
    page_token="string"
)

```

# Get Thread

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/threads/{thread_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/threads/get

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/threads/thread_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.threads.get("inbox_id", "thread_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.threads.get(
    inbox_id="inbox_id",
    thread_id="thread_id"
)

```

```shell
curl https://api.agentmail.to/v0/inboxes/:inbox_id/threads/:thread_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.threads.get(":inbox_id", ":thread_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.threads.get(
    inbox_id=":inbox_id",
    thread_id=":thread_id"
)

```

# Get Attachment

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/threads/{thread_id}/attachments/{attachment_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/threads/get-attachment

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/:inbox_id/threads/:thread_id/attachments/:attachment_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.threads.getAttachment(":inbox_id", ":thread_id", ":attachment_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.threads.get_attachment(
    inbox_id=":inbox_id",
    thread_id=":thread_id",
    attachment_id=":attachment_id"
)

```

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/threads/thread_id/attachments/attachment_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.threads.getAttachment("inbox_id", "thread_id", "attachment_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.threads.get_attachment(
    inbox_id="inbox_id",
    thread_id="thread_id",
    attachment_id="attachment_id"
)

```

# Delete Thread

DELETE https://api.agentmail.to/v0/inboxes/{inbox_id}/threads/{thread_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/threads/delete

## Examples

```shell
curl -X DELETE https://api.agentmail.to/v0/inboxes/inbox_id/threads/thread_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.threads.delete("inbox_id", "thread_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.threads.delete(
    inbox_id="inbox_id",
    thread_id="thread_id"
)

```

```shell
curl -X DELETE https://api.agentmail.to/v0/inboxes/:inbox_id/threads/:thread_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.threads.delete(":inbox_id", ":thread_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.threads.delete(
    inbox_id=":inbox_id",
    thread_id=":thread_id"
)

```

# List Messages

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/messages

Reference: https://docs.agentmail.to/api-reference/inboxes/messages/list

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/messages \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.list("inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.list(
    inbox_id="inbox_id"
)

```

```shell
curl -G https://api.agentmail.to/v0/inboxes/:inbox_id/messages \
     -H "Authorization: Bearer <api_key>" \
     -d limit=0 \
     -d page_token=string
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.list(":inbox_id", {
        limit: 0,
        pageToken: "string",
    });
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.list(
    inbox_id=":inbox_id",
    limit=0,
    page_token="string"
)

```

# Get Message

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/messages/{message_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/messages/get

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/messages/message_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.get("inbox_id", "message_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.get(
    inbox_id="inbox_id",
    message_id="message_id"
)

```

```shell
curl https://api.agentmail.to/v0/inboxes/:inbox_id/messages/:message_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.get(":inbox_id", ":message_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.get(
    inbox_id=":inbox_id",
    message_id=":message_id"
)

```

# Get Attachment

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/messages/{message_id}/attachments/{attachment_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/messages/get-attachment

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/:inbox_id/messages/:message_id/attachments/:attachment_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.getAttachment(":inbox_id", ":message_id", ":attachment_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.get_attachment(
    inbox_id=":inbox_id",
    message_id=":message_id",
    attachment_id=":attachment_id"
)

```

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/messages/message_id/attachments/attachment_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.getAttachment("inbox_id", "message_id", "attachment_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.get_attachment(
    inbox_id="inbox_id",
    message_id="message_id",
    attachment_id="attachment_id"
)

```

# Get Raw Message

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/messages/{message_id}/raw

Reference: https://docs.agentmail.to/api-reference/inboxes/messages/get-raw

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/:inbox_id/messages/:message_id/raw \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.getRaw(":inbox_id", ":message_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.get_raw(
    inbox_id=":inbox_id",
    message_id=":message_id"
)

```

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/messages/message_id/raw \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.getRaw("inbox_id", "message_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.get_raw(
    inbox_id="inbox_id",
    message_id="message_id"
)

```

# Send Message

POST https://api.agentmail.to/v0/inboxes/{inbox_id}/messages/send
Content-Type: application/json

Reference: https://docs.agentmail.to/api-reference/inboxes/messages/send

## Examples

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/inbox_id/messages/send \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.send("inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.send(
    inbox_id="inbox_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/messages/send \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.send(":inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.send(
    inbox_id=":inbox_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/messages/send \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.send(":inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.send(
    inbox_id=":inbox_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/messages/send \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.send(":inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.send(
    inbox_id=":inbox_id"
)

```

# Reply To Message

POST https://api.agentmail.to/v0/inboxes/{inbox_id}/messages/{message_id}/reply
Content-Type: application/json

Reference: https://docs.agentmail.to/api-reference/inboxes/messages/reply

## Examples

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/inbox_id/messages/message_id/reply \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.reply("inbox_id", "message_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.reply(
    inbox_id="inbox_id",
    message_id="message_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/messages/:message_id/reply \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.reply(":inbox_id", ":message_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.reply(
    inbox_id=":inbox_id",
    message_id=":message_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/messages/:message_id/reply \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.reply(":inbox_id", ":message_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.reply(
    inbox_id=":inbox_id",
    message_id=":message_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/messages/:message_id/reply \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.reply(":inbox_id", ":message_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.reply(
    inbox_id=":inbox_id",
    message_id=":message_id"
)

```

# Update Message

PATCH https://api.agentmail.to/v0/inboxes/{inbox_id}/messages/{message_id}
Content-Type: application/json

Reference: https://docs.agentmail.to/api-reference/inboxes/messages/update

## Examples

```shell
curl -X PATCH https://api.agentmail.to/v0/inboxes/inbox_id/messages/message_id \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.update("inbox_id", "message_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.update(
    inbox_id="inbox_id",
    message_id="message_id"
)

```

```shell
curl -X PATCH https://api.agentmail.to/v0/inboxes/:inbox_id/messages/:message_id \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.update(":inbox_id", ":message_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.update(
    inbox_id=":inbox_id",
    message_id=":message_id"
)

```

```shell
curl -X PATCH https://api.agentmail.to/v0/inboxes/:inbox_id/messages/:message_id \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.messages.update(":inbox_id", ":message_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.messages.update(
    inbox_id=":inbox_id",
    message_id=":message_id"
)

```

# List Drafts

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/drafts

Reference: https://docs.agentmail.to/api-reference/inboxes/drafts/list

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/drafts \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.list("inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.list(
    inbox_id="inbox_id"
)

```

```shell
curl -G https://api.agentmail.to/v0/inboxes/:inbox_id/drafts \
     -H "Authorization: Bearer <api_key>" \
     -d limit=0 \
     -d page_token=string
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.list(":inbox_id", {
        limit: 0,
        pageToken: "string",
    });
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.list(
    inbox_id=":inbox_id",
    limit=0,
    page_token="string"
)

```

# Get Draft

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/drafts/{draft_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/drafts/get

## Examples

```shell
curl https://api.agentmail.to/v0/inboxes/inbox_id/drafts/draft_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.get("inbox_id", "draft_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.get(
    inbox_id="inbox_id",
    draft_id="draft_id"
)

```

```shell
curl https://api.agentmail.to/v0/inboxes/:inbox_id/drafts/:draft_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.get(":inbox_id", ":draft_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.get(
    inbox_id=":inbox_id",
    draft_id=":draft_id"
)

```

# Create Draft

POST https://api.agentmail.to/v0/inboxes/{inbox_id}/drafts
Content-Type: application/json

Reference: https://docs.agentmail.to/api-reference/inboxes/drafts/create

## Examples

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/inbox_id/drafts \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.create("inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.create(
    inbox_id="inbox_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/drafts \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.create(":inbox_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.create(
    inbox_id=":inbox_id"
)

```

# Send Draft

POST https://api.agentmail.to/v0/inboxes/{inbox_id}/drafts/{draft_id}/send
Content-Type: application/json

Reference: https://docs.agentmail.to/api-reference/inboxes/drafts/send

## Examples

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/inbox_id/drafts/draft_id/send \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.send("inbox_id", "draft_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.send(
    inbox_id="inbox_id",
    draft_id="draft_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/drafts/:draft_id/send \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.send(":inbox_id", ":draft_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.send(
    inbox_id=":inbox_id",
    draft_id=":draft_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/drafts/:draft_id/send \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.send(":inbox_id", ":draft_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.send(
    inbox_id=":inbox_id",
    draft_id=":draft_id"
)

```

```shell
curl -X POST https://api.agentmail.to/v0/inboxes/:inbox_id/drafts/:draft_id/send \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.send(":inbox_id", ":draft_id", {});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.send(
    inbox_id=":inbox_id",
    draft_id=":draft_id"
)

```

# Delete Draft

DELETE https://api.agentmail.to/v0/inboxes/{inbox_id}/drafts/{draft_id}

Reference: https://docs.agentmail.to/api-reference/inboxes/drafts/delete

## Examples

```shell
curl -X DELETE https://api.agentmail.to/v0/inboxes/inbox_id/drafts/draft_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.delete("inbox_id", "draft_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.delete(
    inbox_id="inbox_id",
    draft_id="draft_id"
)

```

```shell
curl -X DELETE https://api.agentmail.to/v0/inboxes/:inbox_id/drafts/:draft_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.drafts.delete(":inbox_id", ":draft_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.drafts.delete(
    inbox_id=":inbox_id",
    draft_id=":draft_id"
)

```

# List Metrics

GET https://api.agentmail.to/v0/inboxes/{inbox_id}/metrics

Reference: https://docs.agentmail.to/api-reference/inboxes/metrics/get

## Examples

```shell
curl -G https://api.agentmail.to/v0/inboxes/inbox_id/metrics \
     -H "Authorization: Bearer <api_key>" \
     --data-urlencode start_timestamp=2024-01-15T09:30:00Z \
     --data-urlencode end_timestamp=2024-01-15T09:30:00Z
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.metrics.get("inbox_id", {
        startTimestamp: new Date("2024-01-15T09:30:00Z"),
        endTimestamp: new Date("2024-01-15T09:30:00Z"),
    });
}
main();

```

```python
from agentmail import AgentMail
from datetime import datetime

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.metrics.get(
    inbox_id="inbox_id",
    start_timestamp=datetime.fromisoformat("2024-01-15T09:30:00Z"),
    end_timestamp=datetime.fromisoformat("2024-01-15T09:30:00Z")
)

```

```shell
curl -G https://api.agentmail.to/v0/inboxes/:inbox_id/metrics \
     -H "Authorization: Bearer <api_key>" \
     -d event_types=message.sent \
     --data-urlencode start_timestamp=2023-01-01T00:00:00Z \
     --data-urlencode end_timestamp=2023-01-01T00:00:00Z
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.metrics.get(":inbox_id", {
        eventTypes: [
            "message.sent",
        ],
        startTimestamp: new Date("2023-01-01T00:00:00Z"),
        endTimestamp: new Date("2023-01-01T00:00:00Z"),
    });
}
main();

```

```python
from agentmail import AgentMail
from datetime import datetime

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.metrics.get(
    inbox_id=":inbox_id",
    event_types=[
        "message.sent"
    ],
    start_timestamp=datetime.fromisoformat("2023-01-01T00:00:00Z"),
    end_timestamp=datetime.fromisoformat("2023-01-01T00:00:00Z")
)

```

```shell
curl -G https://api.agentmail.to/v0/inboxes/:inbox_id/metrics \
     -H "Authorization: Bearer <api_key>" \
     -d event_types=message.sent \
     --data-urlencode start_timestamp=2023-01-01T00:00:00Z \
     --data-urlencode end_timestamp=2023-01-01T00:00:00Z
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.inboxes.metrics.get(":inbox_id", {
        eventTypes: [
            "message.sent",
        ],
        startTimestamp: new Date("2023-01-01T00:00:00Z"),
        endTimestamp: new Date("2023-01-01T00:00:00Z"),
    });
}
main();

```

```python
from agentmail import AgentMail
from datetime import datetime

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.inboxes.metrics.get(
    inbox_id=":inbox_id",
    event_types=[
        "message.sent"
    ],
    start_timestamp=datetime.fromisoformat("2023-01-01T00:00:00Z"),
    end_timestamp=datetime.fromisoformat("2023-01-01T00:00:00Z")
)

```

# List Threads

GET https://api.agentmail.to/v0/threads

Reference: https://docs.agentmail.to/api-reference/threads/list

## Examples

```shell
curl https://api.agentmail.to/v0/threads \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.threads.list({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.threads.list()

```

```shell
curl -G https://api.agentmail.to/v0/threads \
     -H "Authorization: Bearer <api_key>" \
     -d limit=0 \
     -d page_token=string
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.threads.list({
        limit: 0,
        pageToken: "string",
    });
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.threads.list(
    limit=0,
    page_token="string"
)

```

# Get Thread

GET https://api.agentmail.to/v0/threads/{thread_id}

Reference: https://docs.agentmail.to/api-reference/threads/get

## Examples

```shell
curl https://api.agentmail.to/v0/threads/thread_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.threads.get("thread_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.threads.get(
    thread_id="thread_id"
)

```

```shell
curl https://api.agentmail.to/v0/threads/:thread_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.threads.get(":thread_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.threads.get(
    thread_id=":thread_id"
)

```

# Get Attachment

GET https://api.agentmail.to/v0/threads/{thread_id}/attachments/{attachment_id}

Reference: https://docs.agentmail.to/api-reference/threads/get-attachment

## Examples

```shell
curl https://api.agentmail.to/v0/threads/:thread_id/attachments/:attachment_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.threads.getAttachment(":thread_id", ":attachment_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.threads.get_attachment(
    thread_id=":thread_id",
    attachment_id=":attachment_id"
)

```

```shell
curl https://api.agentmail.to/v0/threads/thread_id/attachments/attachment_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.threads.getAttachment("thread_id", "attachment_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.threads.get_attachment(
    thread_id="thread_id",
    attachment_id="attachment_id"
)

```

# Delete Thread

DELETE https://api.agentmail.to/v0/threads/{thread_id}

Reference: https://docs.agentmail.to/api-reference/threads/delete

## Examples

```shell
curl -X DELETE https://api.agentmail.to/v0/threads/thread_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.threads.delete("thread_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.threads.delete(
    thread_id="thread_id"
)

```

```shell
curl -X DELETE https://api.agentmail.to/v0/threads/:thread_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.threads.delete(":thread_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.threads.delete(
    thread_id=":thread_id"
)

```

# List Drafts

GET https://api.agentmail.to/v0/drafts

Reference: https://docs.agentmail.to/api-reference/drafts/list

## Examples

```shell
curl https://api.agentmail.to/v0/drafts \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.drafts.list({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.drafts.list()

```

```shell
curl -G https://api.agentmail.to/v0/drafts \
     -H "Authorization: Bearer <api_key>" \
     -d limit=0 \
     -d page_token=string
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.drafts.list({
        limit: 0,
        pageToken: "string",
    });
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.drafts.list(
    limit=0,
    page_token="string"
)

```

# Get Draft

GET https://api.agentmail.to/v0/drafts/{draft_id}

Reference: https://docs.agentmail.to/api-reference/drafts/get

## Examples

```shell
curl https://api.agentmail.to/v0/drafts/draft_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.drafts.get("draft_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.drafts.get(
    draft_id="draft_id"
)

```

```shell
curl https://api.agentmail.to/v0/drafts/:draft_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.drafts.get(":draft_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.drafts.get(
    draft_id=":draft_id"
)

```

# List Metrics

GET https://api.agentmail.to/v0/metrics

Reference: https://docs.agentmail.to/api-reference/metrics/list

## Examples

```shell
curl -G https://api.agentmail.to/v0/metrics \
     -H "Authorization: Bearer <api_key>" \
     --data-urlencode start_timestamp=2024-01-15T09:30:00Z \
     --data-urlencode end_timestamp=2024-01-15T09:30:00Z
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.metrics.list({
        startTimestamp: new Date("2024-01-15T09:30:00Z"),
        endTimestamp: new Date("2024-01-15T09:30:00Z"),
    });
}
main();

```

```python
from agentmail import AgentMail
from datetime import datetime

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.metrics.list(
    start_timestamp=datetime.fromisoformat("2024-01-15T09:30:00Z"),
    end_timestamp=datetime.fromisoformat("2024-01-15T09:30:00Z")
)

```

```shell
curl -G https://api.agentmail.to/v0/metrics \
     -H "Authorization: Bearer <api_key>" \
     -d event_types=message.sent \
     --data-urlencode start_timestamp=2023-01-01T00:00:00Z \
     --data-urlencode end_timestamp=2023-01-01T00:00:00Z
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.metrics.list({
        eventTypes: [
            "message.sent",
        ],
        startTimestamp: new Date("2023-01-01T00:00:00Z"),
        endTimestamp: new Date("2023-01-01T00:00:00Z"),
    });
}
main();

```

```python
from agentmail import AgentMail
from datetime import datetime

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.metrics.list(
    event_types=[
        "message.sent"
    ],
    start_timestamp=datetime.fromisoformat("2023-01-01T00:00:00Z"),
    end_timestamp=datetime.fromisoformat("2023-01-01T00:00:00Z")
)

```

# List Domains

GET https://api.agentmail.to/v0/domains

Reference: https://docs.agentmail.to/api-reference/domains/list

## Examples

```shell
curl https://api.agentmail.to/v0/domains \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.domains.list({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.domains.list()

```

# Get Domain

GET https://api.agentmail.to/v0/domains/{domain}

Reference: https://docs.agentmail.to/api-reference/domains/get

## Examples

```shell
curl https://api.agentmail.to/v0/domains/%20your-domain.com \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.domains.get(" your-domain.com");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.domains.get(
    domain=" your-domain.com"
)

```

```shell
curl https://api.agentmail.to/v0/domains/:domain \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.domains.get(":domain");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.domains.get(
    domain=":domain"
)

```

# Create Domain

POST https://api.agentmail.to/v0/domains
Content-Type: application/json

Reference: https://docs.agentmail.to/api-reference/domains/create

## Examples

```shell
curl -X POST https://api.agentmail.to/v0/domains \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{
  "domain": "your-domain.com"
}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.domains.create({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.domains.create()

```

```shell
curl -X POST https://api.agentmail.to/v0/domains \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{
  "domain": "string"
}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.domains.create({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.domains.create()

```

# Delete Domain

DELETE https://api.agentmail.to/v0/domains/{domain}

Reference: https://docs.agentmail.to/api-reference/domains/delete

## Examples

```shell
curl -X DELETE https://api.agentmail.to/v0/domains/dom_12345 \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.domains.delete("dom_12345");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.domains.delete(
    domain="dom_12345"
)

```

```shell
curl -X DELETE https://api.agentmail.to/v0/domains/:domain \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.domains.delete(":domain");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.domains.delete(
    domain=":domain"
)

```

# List Webhooks

GET https://api.agentmail.to/v0/webhooks

Reference: https://docs.agentmail.to/api-reference/webhooks/list

## Examples

```shell
curl https://api.agentmail.to/v0/webhooks \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.webhooks.list({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.webhooks.list()

```

# Get Webhook

GET https://api.agentmail.to/v0/webhooks/{webhook_id}

Reference: https://docs.agentmail.to/api-reference/webhooks/get

## Examples

```shell
curl https://api.agentmail.to/v0/webhooks/webhook_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.webhooks.get("webhook_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.webhooks.get(
    webhook_id="webhook_id"
)

```

```shell
curl https://api.agentmail.to/v0/webhooks/:webhook_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.webhooks.get(":webhook_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.webhooks.get(
    webhook_id=":webhook_id"
)

```

# Create Webhook

POST https://api.agentmail.to/v0/webhooks
Content-Type: application/json

Reference: https://docs.agentmail.to/api-reference/webhooks/create

## Examples

```shell
curl -X POST https://api.agentmail.to/v0/webhooks \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{
  "url": "url",
  "event_types": [
    "message.received",
    "message.received"
  ]
}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.webhooks.create({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.webhooks.create()

```

```shell
curl -X POST https://api.agentmail.to/v0/webhooks \
     -H "Authorization: Bearer <api_key>" \
     -H "Content-Type: application/json" \
     -d '{
  "url": "string",
  "event_types": [
    "message.received"
  ]
}'
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.webhooks.create({});
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.webhooks.create()

```

# Delete Webhook

DELETE https://api.agentmail.to/v0/webhooks/{webhook_id}

Reference: https://docs.agentmail.to/api-reference/webhooks/delete

## Examples

```shell
curl -X DELETE https://api.agentmail.to/v0/webhooks/webhook_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.webhooks.delete("webhook_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.webhooks.delete(
    webhook_id="webhook_id"
)

```

```shell
curl -X DELETE https://api.agentmail.to/v0/webhooks/:webhook_id \
     -H "Authorization: Bearer <api_key>"
```

```typescript
import { AgentMailClient } from "agentmail";

async function main() {
    const client = new AgentMailClient({
        environment: "https://api.agentmail.to",
        apiKey: "YOUR_TOKEN_HERE",
    });
    await client.webhooks.delete(":webhook_id");
}
main();

```

```python
from agentmail import AgentMail

client = AgentMail(
    base_url="https://api.agentmail.to",
    api_key="YOUR_TOKEN_HERE"
)

client.webhooks.delete(
    webhook_id=":webhook_id"
)

```

# August 13, 2025

## Summary

We're excited to introduce **Metrics Endpoints** - two new powerful endpoints that give you deep insights into your email deliverability and agent performance. Track critical events like bounces, deliveries, rejections, and complaints with detailed timestamps.

### What's new?

New endpoints:

* `GET /metrics` - Get comprehensive metrics across all your inboxes
* `GET /inboxes/{inbox_id}/metrics` - Get metrics for a specific inbox

Build smarter agents that monitor their own bounce rates, optimize send timing, and automatically adjust behavior based on deliverability metrics. This unlocks exciting possibilities for self-optimizing agents that can pause campaigns when performance drops or implement intelligent retry strategies.

<Note>
  Ready to build smarter agents? Check out our [metrics
  documentation](https://docs.agentmail.to/api-reference/metrics) to get
  started.
</Note>