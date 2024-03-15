import { Schema, type } from "@colyseus/schema";

function distance2d(x1: number, y1: number, x2: number, y2: number) {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function velocityAxis(
	v: number,
	l: number,
	d: number,
	maxVelocity: number,
	acceleration: number,
) {
	// Slow down as it approaches destination.
	const distance = Math.abs(d - l);
	return (
		Math.sign(v + Math.sign(d - l)) *
		Math.min(
			Math.abs(v + Math.sign(d - l) * acceleration),
			distance * 2,
			maxVelocity,
		)
	);
}

function processLocation({
	velocity,
	location,
}: { velocity: { x: number; y: number }; location: { x: number; y: number } }) {
	const x = Math.min(1, Math.max(-1, velocity.x + location.x));
	const y = Math.min(1, Math.max(-1, velocity.y + location.y));

	return { x, y };
}

function processVelocity(
	acceleration: number,
	maxVelocity: number,
	location: { x: number; y: number },
	destination: { x: number; y: number },
	velocity: { x: number; y: number },
) {
	const x = velocityAxis(
		velocity.x,
		location.x,
		destination.x,
		maxVelocity,
		acceleration,
	);
	const y = velocityAxis(
		velocity.y,
		location.y,
		destination.y,
		maxVelocity,
		acceleration,
	);
	return { x, y };
}

const acceleration = 0.001;
const maxVelocity = 0.003;
export class Player extends Schema {
	@type("string") id = "";
	@type("number") x = 0;
	@type("number") y = 0;
	vx = 0;
	vy = 0;
	dx = 0;
	dy = 0;
	connected = true;
	@type("boolean") isBot = false;

	update(deltaTime: number) {
		const velocity = processVelocity(
			acceleration,
			maxVelocity,
			{ x: this.x, y: this.y },
			{ x: this.dx, y: this.dy },
			{ x: this.vx, y: this.vy },
		);
		this.vx = velocity.x;
		this.vy = velocity.y;

		const location = processLocation({
			velocity: { x: this.vx, y: this.vy },
			location: { x: this.x, y: this.y },
		});
		this.x = location.x;
		this.y = location.y;

		if (this.isBot) {
			if (distance2d(this.x, this.y, this.dx, this.dy) < 0.01) {
				this.dx = Math.random() * 2 - 1;
				this.dy = Math.random() * 2 - 1;
			}
		}
	}

	setDestination(x: number, y: number) {
		this.dx = x;
		this.dy = y;
	}
}
