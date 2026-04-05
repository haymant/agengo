const { spawn } = require('node:child_process');

const room = process.env.TRACO_P2P_ROOM || 'traco-test-room';
const command = process.env.TRACO_SOCIETY_COMMAND || 'npx';
const baseArgs = process.env.TRACO_SOCIETY_COMMAND
  ? []
  : ['-y', 'society'];

function startNode(name, port) {
  const args = [
    ...baseArgs,
    '--name',
    name,
    '--room',
    room,
    '--relay',
    '--port',
    String(port),
  ];
  const child = spawn(command, args, {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  return child;
}

async function main() {
  const node1 = startNode(process.env.TRACO_P2P_NODE1 || 'traco-node-1', process.env.TRACO_P2P_PORT1 || 8081);
  const node2 = startNode(process.env.TRACO_P2P_NODE2 || 'traco-node-2', process.env.TRACO_P2P_PORT2 || 8082);

  const shutdown = () => {
    node1.kill('SIGTERM');
    node2.kill('SIGTERM');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('Started two Society nodes for same-host testing.');
  console.log(`Room: ${room}`);
  console.log('Next steps:');
  console.log('1) Share a chat on node 1 via POST /api/chats/{chatId}/share');
  console.log('2) Pull the shared snapshot on node 2 via POST /api/chats/remote/{shareId}/pull');
  console.log('3) Start a remote handoff via POST /api/handoff/v1/sessions');
  console.log('4) Attach memory and artifacts, then finalize from the target node with the issued bearer token');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
