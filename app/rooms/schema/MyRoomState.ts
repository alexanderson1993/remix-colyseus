import { Schema, Context, type, MapSchema } from "@colyseus/schema";
import { Player } from "./PlayerState";

export class MyRoomState extends Schema {
	@type("string") mySynchronizedProperty = "Hello world";
	@type("number") counter = 0;
	@type({ map: Player }) players = new MapSchema<Player>();

	update(deltaTime: number) {
		this.counter++;
		for (const player of this.players.values()) {
			player.update(deltaTime);
		}
	}
}
