/*
Minimal P2P harness example (Node.js).

This script attempts to load `society-protocol`. If available, it shows how to create a client and listen for peers.
It is intentionally non-blocking and prints next steps for manual test flows.
*/

async function main() {
  let society;
  try {
    society = require('society-protocol');
  } catch (err) {
    console.error('society-protocol not installed. Install with: npm install society-protocol');
    console.log('Or use the CLI: npx society --help');
    process.exit(0);
  }

  console.log('Creating a Society client (example).');
  // Note: API may differ; this is illustrative. Check society-protocol docs.
  const client = society.createClient && society.createClient();
  if (!client) {
    console.log('society-protocol API not available via require; try using the CLI (npx society) for manual testing.');
    process.exit(0);
  }

  console.log('Client created. Use the client to join rooms and discover peers.');
  console.log('Manual test steps:');
  console.log('1) Start two nodes:');
  console.log('   npx society --name traco-node-1 --room traco-test-room --relay');
  console.log('   npx society --name traco-node-2 --room traco-test-room --relay');
  console.log('2) Create a handoff session on the hub to traco-node-2 and obtain a WorkSecret.');
  console.log('3) Use the client or open a libp2p stream to the source node and present the WorkSecret to fetch artifacts.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
