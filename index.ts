import { FastMCP } from "fastmcp";
import { z } from "zod"; // Or any validation library that supports Standard Schema
import swagger from './swagger.json'

const server = new FastMCP({
  name: swagger.info.title,
  version: '1.0.0',
  instructions: swagger.info.description
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
    paramShape[param.name] = (param.required ? zodTypeFromSchema(param.schema) : zodTypeFromSchema(param.schema).optional());
  }
  server.addTool({
    name: details.operationId,
    description: details.summary || details.description,
    parameters: z.object(paramShape),
    async execute(args) {
      // Build query string
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(args)) {
        if (v !== undefined && v !== null) params.append(k, String(v));
      }
      const url = `https://api.openbus.stride.org.il${path}?${params.toString()}`;
      const res = await fetch(url);
      const text = await res.text();
      return { type: 'text', text };
    }
  });
}

server.start({
  transportType: "httpStream",
  httpStream: {
    port: 3000
  }
});
