#!/usr/bin/env node

import { createMCPServer } from '@intelagent/mcp-shared';
import { TextService } from './services/text-service.js';
import { textTools } from './tools/text-tools.js';

const service = new TextService();

createMCPServer({
  name: 'my-mcp-server',
  version: '1.0.0',
  tools: textTools(service),
});
