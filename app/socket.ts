import * as Colyseus from "colyseus.js";
import { useEffect, useRef, useState } from "react";

let singletonClient: Colyseus.Client;
export function useSocket() {
	const [client] = useState(() => {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		if (typeof window === "undefined") return null!;
		if (singletonClient) return singletonClient;
		const hostname = window.location.hostname;
		const protocol = window.location.protocol;

		const port = Number.parseInt(window.location.port);

		const socketUrl = `${
			protocol === "https:" ? "wss" : "ws"
		}://${hostname}:${port}`;

		singletonClient = new Colyseus.Client(socketUrl);

		return singletonClient;
	});

	return client;
}

const rooms = new Map<string, Colyseus.Room>();
export function useRoom<RoomState>(roomName: string) {
	const client = useSocket();
	const [room, setRoom] = useState<Colyseus.Room<RoomState> | null>(() => {
		const room = rooms.get(roomName);
		if (room?.connection.isOpen) {
			return room;
		}
		return null;
	});

	const effectRan = useRef(false);
	useEffect(() => {
		if (effectRan.current) return;
		if (!room) {
			effectRan.current = true;
			client
				.joinOrCreate<RoomState>(roomName)
				.then((room) => {
					rooms.set(roomName, room);
					setRoom(room);
				})
				.catch((e) => {
					console.error(e);
				});
		}
	}, [client, room, roomName]);

	return room;
}
