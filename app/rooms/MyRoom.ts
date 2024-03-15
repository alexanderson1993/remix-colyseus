import { Room, type Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Player } from "./schema/PlayerState";
import colyseus from "colyseus";
type MyRoomOptions = unknown;

function newPlayer(id: string, isBot = false) {
	const player = new Player();
	player.id = id;
	player.x = Math.random() * 2 - 1;
	player.y = Math.random() * 2 - 1;
	player.dx = Math.random() * 2 - 1;
	player.dy = Math.random() * 2 - 1;
	player.isBot = isBot;
	return player;
}
export class MyRoom extends Room<MyRoomState> {
	maxClients = 4;

	onCreate(options: MyRoomOptions) {
		this.setState(new MyRoomState());

		this.setSimulationInterval((deltaTime) => this.update(deltaTime));
		this.onMessage("setDestination", (client, message) => {
			this.state.players
				.get(client.sessionId)
				?.setDestination(message.x, message.y);
		});
		for (let i = 0; i < 4; i++) {
			const id = colyseus.generateId();
			this.state.players.set(id, newPlayer(id, true));
		}
	}

	onJoin(client: Client, options: MyRoomOptions) {
		console.log(client.sessionId, "joined!");
		const id = client.sessionId;
		this.state.players.set(client.sessionId, newPlayer(id));
	}

	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");
		this.state.players.delete(client.sessionId);
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...");
	}

	update(deltaTime: number) {
		this.clock.tick();
		this.state.update(deltaTime);
	}
}
