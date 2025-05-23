# Open Bus MCP SSE Server

This repository provides an auto-generated [MCP](https://modelcontextprotocol.io/) server for the Open Bus Stride API, exposing all endpoints as MCP tools for use with LLMs and agent-based workflows.

## Quick Start

1. **Clone the repository**

```zsh
git clone git@github.com:NoamGaash/open-bus-mcp.git
# Alternatively, you can git clone git@github.com:NoamGaash/open-bus-mcp.git
cd open-bus-mcp-sse
```

2. **Install dependencies**

```zsh
npm install
```

3. **Start the MCP server**

```zsh
npm start
```

The server will start on port 3000 by default (see `index.ts`).

---

## Using in VS Code with GitHub Copilot Agent

1. **Open the folder in VS Code**
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the Command Palette.
3. Type `MCP: List MCP Servers` and select it.
4. You should see your running MCP server listed (if not, make sure it is running and accessible on port 3000).
5. Open GitHub Copilot Chat and switch to **Agent** (look for a dropdown with "Ask" or "Edit" and change to "agent" or use the command palette: `Chat: Open Chat (agent)`).
6. Make sure the MCP tool is enabled in Copilot's tool list (click the tools icon in the button of the screen).
7. You can now ask Copilot to use the MCP tools provided by this server, such as querying bus rides, stops, and more.

---

## Troubleshooting

- If you do not see the MCP server in the list, ensure it is running and accessible on the correct port.
- Feel free to reach out to the community in the [Public Knowledge Workshop Slack Server](https://join.slack.com/t/hasadna/shared_invite/zt-21qipktl1-7yF4FYJVxAqXl0wE4DlMKQ)
---

## License

MIT or as specified in this repository.
