# Welcome to Remix + Colyseus!

📖 See the [Remix docs](https://remix.run/docs) and the [Colyseus](https://docs.colyseus.io) for details on supported features.

## Development

Run the Express + Colyseus server with Vite dev middleware:

```shellscript
npm run dev
```

It's set up so editing Colyseus rooms and schemas will trigger a full server reload, while editing Remix routes will trigger Hot-Data Reloading

It currently doesn't build for production. You need to both build the Remix client and server, and build the Colyseus server, and then run the Colyseus server.

## What it does?

It models a handful of players which pick a point and travel towards it. Any connected players appear as a red dot which will follow the mouse cursor. All movement is handled on the server and sent as patches to connected clients.

It currently directly updates the DOM nodes, since updating DOM directly is faster than React state updates for high frequency updates. It does not perform any kind of linear interpolation.

The `useRoom` hook makes it easy to connect to other rooms. It automatically caches any open rooms, so you can reuse the hook with the same room without creating another room instance and re-joining.

This is mostly a proof-of-concept, but it can be used to create full-stack, server-rendered web-based realtime multiplayer game. 