import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import colyseus from "colyseus";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createServer } from "node:http";
import { MyRoom } from "~/rooms/MyRoom.js";

installGlobals();

const viteDevServer =
	process.env.NODE_ENV === "production"
		? undefined
		: await import("vite").then((vite) =>
				vite.createServer({
					server: { middlewareMode: true },
				}),
		  );

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// handle asset requests
if (viteDevServer) {
	app.use(viteDevServer.middlewares);
} else {
	// Vite fingerprints its assets so we can cache forever.
	app.use(
		"/assets",
		express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
	);
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));
const httpServer = createServer(app);
const gameServer = new colyseus.Server({
	transport: new WebSocketTransport({ server: httpServer }),

	// driver: new RedisDriver(),
	// presence: new RedisPresence(),
	greet: false,
});

gameServer.define("my_room", MyRoom).enableRealtimeListing();

app.use("/monitor", monitor());
app.use("/playground", playground);

const remixHandler = createRequestHandler({
	// @ts-ignore
	build: viteDevServer
		? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
		: // @ts-ignore this file doesn't exist before build
		  await import("./build/server/index.js"),
});
// handle SSR requests
app.all("*", remixHandler);

const port = Number(process.env.PORT || 3000);
await gameServer.listen(port);
console.log(`Express server listening at http://localhost:${port}`);
