#!/usr/bin/env node
// Minimal mock Society sidecar for local development and testing.
// Implements the subset of endpoints used by Traco Hub tests:
//  - GET/POST /v1/discovery/candidates
//  - POST /v1/shares/chat
//  - GET  /v1/shares/chat
//  - GET  /v1/shares/chat/:id
//  - POST /v1/shares/project
//  - GET  /v1/shares/project
//  - GET  /v1/shares/project/:id
//  - POST /v1/handoffs
//  - GET  /v1/handoffs
//  - GET  /v1/handoffs/:id
//  - POST /v1/handoffs/:id/accept

import http from "node:http";
import { URL } from "node:url";

const args = process.argv.slice(2);
let port = 3001;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "-p" || args[i] === "--port") && args[i + 1]) {
    port = Number(args[i + 1]);
  }
}

const candidates = [];
const chatShares = new Map();
const projectShares = new Map();
const handoffs = new Map();

function sendJson(res, payload, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(`${JSON.stringify(payload)}\n`);
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "/", `http://127.0.0.1:${port}`);

  const body = await new Promise((resolve) => {
    let collected = "";
    req.on("data", (chunk) => (collected += chunk.toString()));
    req.on("end", () => resolve(collected));
    req.on("error", () => resolve(""));
  });

  if (req.method === "GET" && reqUrl.pathname === "/v1/discovery/candidates") {
    const roomId = reqUrl.searchParams.get("roomId");
    sendJson(res, { candidates: candidates.filter(c => (roomId ? c.roomId === roomId : true)) });
    return;
  }

  if (req.method === "POST" && reqUrl.pathname === "/v1/discovery/candidates") {
    try {
      const payload = JSON.parse(body);
      for (const candidate of payload.candidates || []) {
        const existing = candidates.findIndex(c => c.nodeId === candidate.nodeId && c.roomId === candidate.roomId && c.agentId === candidate.agentId);
        if (existing >= 0) candidates.splice(existing, 1, candidate);
        else candidates.push(candidate);
      }
      sendJson(res, { ok: true }, 201);
    } catch (e) {
      sendJson(res, { error: "invalid payload" }, 400);
    }
    return;
  }

  if (req.method === "POST" && reqUrl.pathname === "/v1/shares/chat") {
    try {
      const share = JSON.parse(body);
      chatShares.set(share.shareId, share);
      sendJson(res, { ok: true }, 201);
    } catch (e) {
      sendJson(res, { error: "invalid payload" }, 400);
    }
    return;
  }

  if (req.method === "GET" && reqUrl.pathname === "/v1/shares/chat") {
    const roomId = reqUrl.searchParams.get("roomId");
    const srcId = reqUrl.searchParams.get("sourceProjectId");
    const shares = [...chatShares.values()].filter(s => (roomId ? s.roomId === roomId : true)).filter(s => (srcId ? s.projectId === srcId : true)).map(share => ({
      canonicalPath: share.canonicalPath,
      expiresAt: share.expiresAt,
      messageCount: share.snapshot?.messages?.length ?? 0,
      projectId: share.projectId,
      provenance: share.provenance,
      publishedAt: share.publishedAt,
      roomId: share.roomId,
      scope: share.scope,
      shareId: share.shareId,
      sourceChatId: share.sourceChatId,
      sourceNodeId: share.sourceNodeId,
      sourceNodeName: share.sourceNodeName,
      sourceRemoteUserId: share.sourceRemoteUserId,
      title: share.title,
      version: share.version,
    }));
    sendJson(res, { shares });
    return;
  }

  if (req.method === "GET" && reqUrl.pathname.startsWith("/v1/shares/chat/")) {
    const id = reqUrl.pathname.split("/").at(-1) || "";
    sendJson(res, { share: chatShares.get(id) ?? null });
    return;
  }

  if (req.method === "POST" && reqUrl.pathname === "/v1/shares/project") {
    try {
      const share = JSON.parse(body);
      projectShares.set(share.shareId, share);
      sendJson(res, { ok: true }, 201);
    } catch (e) {
      sendJson(res, { error: "invalid payload" }, 400);
    }
    return;
  }

  if (req.method === "GET" && reqUrl.pathname === "/v1/shares/project") {
    const shares = [...projectShares.values()].map(share => ({
      canonicalPath: share.canonicalPath,
      chatCount: share.snapshot?.chatCount ?? 0,
      expiresAt: share.expiresAt,
      latestChatCreatedAt: share.snapshot?.latestChatCreatedAt ?? null,
      projectId: share.projectId,
      provenance: share.provenance,
      publishedAt: share.publishedAt,
      roomId: share.roomId,
      scope: share.scope,
      shareId: share.shareId,
      sourceNodeId: share.sourceNodeId,
      sourceNodeName: share.sourceNodeName,
      sourceProjectId: share.sourceProjectId,
      sourceRemoteUserId: share.sourceRemoteUserId,
      title: share.title,
      version: share.version,
    }));
    sendJson(res, { shares });
    return;
  }

  if (req.method === "GET" && reqUrl.pathname.startsWith("/v1/shares/project/")) {
    const id = reqUrl.pathname.split("/").at(-1) || "";
    sendJson(res, { share: projectShares.get(id) ?? null });
    return;
  }

  if (req.method === "POST" && reqUrl.pathname === "/v1/handoffs") {
    try {
      const payload = JSON.parse(body);
      const handoff = payload.handoff;
      handoffs.set(handoff.sessionId, handoff);
      sendJson(res, { ok: true, handoff }, 201);
    } catch (e) {
      sendJson(res, { error: "invalid payload" }, 400);
    }
    return;
  }

  if (req.method === "GET" && reqUrl.pathname === "/v1/handoffs") {
    const targetNodeId = reqUrl.searchParams.get("targetNodeId");
    const roomId = reqUrl.searchParams.get("roomId");
    const status = reqUrl.searchParams.get("status");
    const filtered = [...handoffs.values()]
      .filter((handoff) => (targetNodeId ? handoff.target?.nodeId === targetNodeId : true))
      .filter((handoff) => (roomId ? handoff.roomId === roomId : true))
      .filter((handoff) => (status ? handoff.status === status : true));
    sendJson(res, { handoffs: filtered });
    return;
  }

  if (req.method === "GET" && reqUrl.pathname.startsWith("/v1/handoffs/")) {
    const parts = reqUrl.pathname.split("/");
    const id = parts.at(-1) || "";

    if (parts.at(-1) === "accept") {
      sendJson(res, { error: "not found" }, 404);
      return;
    }

    sendJson(res, { handoff: handoffs.get(id) ?? null });
    return;
  }

  if (req.method === "POST" && reqUrl.pathname.startsWith("/v1/handoffs/") && reqUrl.pathname.endsWith("/accept")) {
    try {
      const parts = reqUrl.pathname.split("/");
      const sessionId = parts.at(-2) || "";
      const existing = handoffs.get(sessionId);

      if (!existing) {
        sendJson(res, { handoff: null }, 404);
        return;
      }

      const payload = JSON.parse(body);
      const updated = {
        ...existing,
        acceptedAt: existing.acceptedAt ?? new Date().toISOString(),
        acceptedByNodeId: payload.acceptedByNodeId ?? existing.acceptedByNodeId ?? null,
        acceptedByUserId: payload.acceptedByUserId ?? existing.acceptedByUserId ?? null,
        status: "accepted",
        updatedAt: new Date().toISOString(),
      };
      handoffs.set(sessionId, updated);
      sendJson(res, { handoff: updated });
    } catch (e) {
      sendJson(res, { error: "invalid payload" }, 400);
    }
    return;
  }

  sendJson(res, { error: "not found" }, 404);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock Society sidecar listening at http://127.0.0.1:${port}`);
  console.log("Endpoints: GET/POST /v1/discovery/candidates, POST/GET /v1/shares/chat, GET /v1/shares/chat/:id, POST/GET /v1/shares/project, GET /v1/shares/project/:id");
  console.log("Press Ctrl+C to stop");
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
