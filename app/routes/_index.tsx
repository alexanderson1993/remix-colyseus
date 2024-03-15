import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import type { MyRoomState } from "~/rooms/schema/MyRoomState";
import type { Player } from "~/rooms/schema/PlayerState";
import { useRoom } from "~/socket";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export default function Index() {
	const [players, setPlayers] = useState<Player[]>([]);
	const room = useRoom<MyRoomState>("my_room");
	useEffect(() => {
		if (!room) return;
		setPlayers((players) => [
			...players,
			...Array.from(room.state.players.values()),
		]);
		room.state.players.onAdd((player, sessionId) => {
			setPlayers((players) => [...players, player]);
			player.onChange(() => {
				const el = document.getElementById(player.id);
				if (el)
					el.style.transform = `translate(${player.x * 50 + 50}%, ${
						player.y * 50 + 50
					}%)`;
			});
		});
		room.state.players.onRemove((player, sessionId) => {
			setPlayers((players) => players.filter((p) => p.id !== player.id));
		});
		room.state.players.onChange((player, sessionId) => {});
	}, [room]);
	return (
		<div
			style={{
				position: "relative",
				width: "100vw",
				height: "100vh",
				background: "black",
			}}
			onMouseMove={(e) =>
				room?.send("setDestination", {
					x: e.clientX / window.innerWidth - 0.5,
					y: e.clientY / window.innerHeight - 0.5,
				})
			}
		>
			{players.map((player) => (
				<div
					id={player.id}
					key={String(player.id)}
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						transform: `translate(${player.x * 50 + 50}%, ${
							player.y * 50 + 50
						}%)`,
					}}
				>
					<div
						style={{
							background: player.isBot ? "rebeccaPurple" : "red",
							borderRadius: "50%",
							width: "2rem",
							height: "2rem",
							transform: "translate(-50%, -50%)",
						}}
					/>
				</div>
			))}
		</div>
	);
}
