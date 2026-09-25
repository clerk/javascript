import { McpServer } from '@modelcontextprotocol/server';
import express from 'express';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createClerkMcpAuth } from '../express';
import {
  authInfoFor,
  legacyInitialize,
  modernToolCall,
  PUBLISHABLE_KEY,
  RESOURCE,
  RESOURCE_METADATA_URL,
  toolCall,
} from './helpers';

const verifyAccessToken = vi.fn();

function create() {
  return createClerkMcpAuth({
    resource: RESOURCE,
    publishableKey: PUBLISHABLE_KEY,
    verifier: { verifyAccessToken },
    scopes: ['user:org:read', 'applications:manage'],
    baselineScopes: ['user:org:read'],
    tools: { create_application: ['applications:manage'] },
  });
}

function app(clerkMcp = create()) {
  const server = express();
  server.use(express.json());
  server.get('/.well-known/oauth-protected-resource/mcp', clerkMcp.protectedResourceMetadata());
  server.get('/.well-known/oauth-authorization-server', clerkMcp.authorizationServerMetadata());
  server.use('/mcp', clerkMcp.requireAuth());
  server.all('/mcp', (req, res) => {
    res.json({ auth: (req as express.Request & { auth?: unknown }).auth ?? null });
  });
  return server;
}

describe('@clerk/mcp-tools/express', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('challenges anonymous requests and skips preflight', async () => {
    const server = app();

    const refused = await supertest(server).get('/mcp');
    const preflight = await supertest(server).options('/mcp');

    expect(refused.status).toBe(401);
    expect(refused.headers['www-authenticate']).toBe(
      `Bearer scope="user:org:read", resource_metadata="${RESOURCE_METADATA_URL}"`,
    );
    expect(refused.body).toEqual({ error: 'unauthorized' });
    expect(preflight.status).toBe(200);
  });

  it('attaches verified auth info to the request', async () => {
    const authInfo = authInfoFor();
    verifyAccessToken.mockResolvedValue(authInfo);

    const response = await supertest(app()).get('/mcp').set('Authorization', 'Bearer mcp-access-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ auth: { ...authInfo, resource: RESOURCE } });
  });

  it('uses the parsed body for step-up challenges', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));

    const response = await supertest(app())
      .post('/mcp')
      .set('Authorization', 'Bearer mcp-access-token')
      .send(toolCall('create_application'));

    expect(response.status).toBe(403);
    expect(response.headers['www-authenticate']).toContain('scope="user:org:read applications:manage"');
  });

  it('checks tool scopes when no body parser is mounted', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));
    const clerkMcp = create();
    const server = express();
    server.use('/mcp', clerkMcp.requireAuth());
    server.all('/mcp', (req, res) => {
      res.json({ body: req.body });
    });

    const refused = await supertest(server)
      .post('/mcp')
      .set('Authorization', 'Bearer mcp-access-token')
      .send(toolCall('create_application'));

    expect(refused.status).toBe(403);
    expect(refused.headers['www-authenticate']).toContain('scope="user:org:read applications:manage"');
  });

  it('refuses a malformed JSON body instead of skipping the scope check', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));
    const handler = vi.fn();
    const server = express();
    server.all('/mcp', create().requireAuth(), handler);

    const response = await supertest(server)
      .post('/mcp')
      .set('Authorization', 'Bearer mcp-access-token')
      .set('Content-Type', 'application/json')
      .send('{"method":"tools/call"');

    expect(response.status).toBe(400);
    expect(handler).not.toHaveBeenCalled();
  });

  it('answers verifier failures with a bare 500', async () => {
    verifyAccessToken.mockRejectedValue(new Error('sensitive'));

    const response = await supertest(app()).get('/mcp').set('Authorization', 'Bearer mcp-access-token');

    expect(response.status).toBe(500);
    expect(response.text).not.toContain('sensitive');
  });

  it('serves the discovery documents with CORS headers', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ issuer: 'https://clerk.example.com' }));
    const server = app();

    const resource = await supertest(server).get('/.well-known/oauth-protected-resource/mcp');
    const authorizationServer = await supertest(server).get('/.well-known/oauth-authorization-server');

    expect(resource.status).toBe(200);
    expect(resource.headers['access-control-allow-origin']).toBe('*');
    expect(resource.body.resource).toBe(RESOURCE);
    expect(authorizationServer.body.issuer).toBe('https://clerk.example.com');
  });

  describe('mcpHandler', () => {
    const ran = vi.fn();

    function mcpApp() {
      const clerkMcp = create();
      const server = express();
      server.all(
        '/mcp',
        clerkMcp.mcpHandler(() => {
          const mcp = new McpServer({ name: 'test-server', version: '1.0.0' });
          mcp.registerTool(
            'create_application',
            { inputSchema: z.object({}) },
            clerkMcp.withScopes('create_application', () => {
              ran();
              return { content: [{ type: 'text', text: 'created' }] };
            }),
          );
          return mcp;
        }),
      );
      return server;
    }

    function callTool(server: express.Express) {
      const { headers, body } = modernToolCall('create_application');
      return supertest(server)
        .post('/mcp')
        .set({ ...headers, Authorization: 'Bearer mcp-access-token' })
        .send(body);
    }

    it('serves an MCP exchange for a valid token', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor());

      const response = await supertest(mcpApp())
        .post('/mcp')
        .set('Authorization', 'Bearer mcp-access-token')
        .set('Accept', 'application/json, text/event-stream')
        .send(legacyInitialize());

      expect(response.status).toBe(200);
      expect(response.text).toContain('"protocolVersion":"2025-06-18"');
    });

    it('verifies a request once when requireAuth() sits in front of it', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor());
      const clerkMcp = create();
      const server = express();
      server.all(
        '/mcp',
        clerkMcp.requireAuth(),
        clerkMcp.mcpHandler(() => new McpServer({ name: 'test-server', version: '1.0.0' })),
      );

      const response = await supertest(server)
        .post('/mcp')
        .set('Authorization', 'Bearer mcp-access-token')
        .set('Accept', 'application/json, text/event-stream')
        .send(legacyInitialize());

      expect(response.status).toBe(200);
      expect(verifyAccessToken).toHaveBeenCalledOnce();
    });

    it('challenges anonymous requests on its own', async () => {
      const response = await supertest(mcpApp()).post('/mcp').send(legacyInitialize());

      expect(response.status).toBe(401);
      expect(verifyAccessToken).not.toHaveBeenCalled();
    });

    it('refuses an underscoped tool call before dispatch, without a body parser', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));

      const response = await callTool(mcpApp());

      expect(response.status).toBe(403);
      expect(ran).not.toHaveBeenCalled();
    });

    it('runs a tool call the grant covers', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read', 'applications:manage'] }));

      const response = await callTool(mcpApp());

      expect(response.status).toBe(200);
      expect(ran).toHaveBeenCalledOnce();
    });
  });
});
