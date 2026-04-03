Single-node Society relay (docker-compose)

This composition runs a single Society (libp2p) relay node suitable for local/home-network testing and CI experiments.

Quick start

1. From the `tests/p2p` folder run:

```bash
docker compose up -d
```

2. Watch logs:

```bash
docker compose logs -f traco-society-relay
```

3. Start other local nodes (on the same LAN or using the relay address) and join `traco-test-room` as shown in `tests/p2p/README.md`.

Notes and limitations

- This is intended for development and small-scale testing only. For production, run a multi-node relay cluster (HA) and use an authenticated relay provider.
- The compose script uses `npx society` to fetch the CLI at container start. The container will download packages on first start; prefer building a dedicated image for CI.
- Exposed ports: `4001` (TCP), `4002` (QUIC/UDP). Ensure your router/firewall allows UDP if using QUIC.
- If running on a NAT'd home router, consider enabling UPnP or set up port forwarding for the mapped ports.

Customizations

- To persist identity across restarts, edit `./data/society` volume.
- To change room name, update `--room` argument in `docker-compose.yml`.
