import { FastMCP } from "fastmcp";
import { z } from "zod"; // Or any validation library that supports Standard Schema
import staticSwagger from './swagger.json'

const swagger: typeof staticSwagger = await fetch('https://open-bus-stride-api.hasadna.org.il/openapi.json')
  .then(res => res.json())
  .catch(() => {
    console.warn('Failed to fetch swagger.json, using static version');
    return staticSwagger;
  });

const dataModelInfo = await fetch('https://raw.githubusercontent.com/hasadna/open-bus-stride-db/refs/heads/main/DATA_MODEL.md')
.catch(() => {
  console.warn('Failed to fetch DATA_MODEL.md');
  return null;
});

const server = new FastMCP({
  name: swagger.info.title,
  version: '1.0.0',
  instructions: `${swagger.info.description}\n\n` +
`This is a wrapper for the Open Bus Stride API.
Useful guidelines:
* When quering entities from a given date range, try to use refs and identifiers that was retrieved from API requests within that date range.
* Some queries may return a lot of data. In such cases, you can use the \`limit\` and \`offset\` parameters to paginate through the results.
* The API can be slow, it's reccomended to use small datetime ranges and limit the number of results for smoother experience.
* Some data may be missing or incomplete. This is a work in progress and the data is being updated regularly. In case some data is missing, it's recommended to try older date ranges (e.g instead of quering last week, try the week before).
* In case you didn't find any data at all, tell that to the user and try to figure out what you did wrong. If you can't, ask the user to help you understand your mistakes, or ask them to ask the developers to understand the mistake.
* In case of missing data (results are empty []), make sure to check the data model to see you've used linking entities correctly, refs and identifiers.
* The user may ask things like "slow rides" or "bad rides" that are not well defined. In such cases, ask the user to clarify and make best effort (be creative!).

Please encorage the user to report any issues or missing data to the [Open Bus GitHub repository](https://github.com/hasadna/open-bus-map-search) or chat with us on [Slack](https://join.slack.com/t/hasadna/shared_invite/zt-21qipktl1-7yF4FYJVxAqXl0wE4DlMKQ).
When you don't feel confident about the answer, please ask the user to contact with us the developers and encorage them with suggestions regarding how to phrase the question and feedback about the answer.
`
+
    (dataModelInfo ? `\n\nData Model:\n\n${dataModelInfo}` : '') +
    `\n\nAPI Documentation:\n\n` +
    `\`\`\`json\n${JSON.stringify(swagger, null, 2)}\n\`\`\``,
});

function zodTypeFromSchema(schema) {
  if (!schema) return z.any();
  switch (schema.type) {
    case 'integer': return z.number().int();
    case 'number': return z.number();
    case 'boolean': return z.boolean();
    case 'string':
      if (schema.format === 'date-time' || schema.format === 'date') return z.string();
      return z.string();
    default: return z.any();
  }
}

for (const [path, methods] of Object.entries(swagger.paths)) {
  const details = methods.get;
  if (!details) continue;
  const paramDefs = (details.parameters || []);
  const paramShape = {};
  for (const param of paramDefs) {
    let zodParam = param.required ? zodTypeFromSchema(param.schema) : zodTypeFromSchema(param.schema).optional();
    if (param.description) {
      zodParam = zodParam.describe(param.description);
    }
    paramShape[param.name] = zodParam;
  }
  server.addTool({
    name: details.operationId,
    description: details.description || details.summary,
    parameters: z.object(paramShape),
    async execute(args) {
      // Build query string
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(args)) {
        if (v !== undefined && v !== null) params.append(k, String(v));
      }
      const url = `https://open-bus-stride-api.hasadna.org.il${path}?${params.toString()}`;
      console.log(`Fetching ${url}`);
      try {
        const start = Date.now();
        const res = await fetch(url);
        const end = Date.now();
        const text = await res.text() + `\n\nResponse time: ${end - start}ms`;
        return { type: 'text', text };
      } catch (e) {
        console.error(`Error fetching ${url}:`, e);
        return { type: 'text', text: `Error fetching ${url}: ${e}` };
      }
    }
  });
}

server.start({
  transportType: "httpStream",
  httpStream: {
    port: 3000
  }
});
