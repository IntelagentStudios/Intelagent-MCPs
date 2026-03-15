#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createMCPServer } from '@intelagent/mcp-shared';
import { FileProcessorService } from './file-processor-service.js';
import { fileProcessorTools } from './tools.js';

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const service = new FileProcessorService();

createMCPServer({
  name: pkg.name,
  version: pkg.version,
  tools: fileProcessorTools(service),
  resources: [
    {
      uri: 'file-processor://supported-types',
      name: 'Supported File Types',
      description: 'Lists all supported MIME types and file extensions',
      handler: async () => JSON.stringify(service.getSupportedTypes(), null, 2),
    },
  ],
});
