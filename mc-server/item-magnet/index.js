/** 
Script made by:
   ___                                    _ _     _ 
  |_  |                                  (_|_)   | |
    | | ___  __ _ _ __    _ __ ___   __ _ _ _  __| |
    | |/ _ \/ _` | '_ \  | '_ ` _ \ / _` | | |/ _` |
/\__/ /  __/ (_| | | | | | | | | | | (_| | | | (_| |
\____/ \___|\__,_|_| |_| |_| |_| |_|\__,_| |_|\__,_|
                                        _/ |        
                                       |__/         

Fell free to use and modify it as you wish. Try to learn from it, not just copy and paste and maybe give some credit to me in any way shape or form. :)
*/

import { world, system } from "@minecraft/server";
import { spawnRandomItems } from "./test";

const range = 12;
const strengthMultiplier = 0.04;

system.runInterval(() => {
    const players = world.getPlayers();
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const location = player.location;
        const entities = player.dimension.getEntities({ type: "item", location, maxDistance: range });
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const direction = subtractVector(location, entity.location);
            direction.y += 1;
            entity.applyImpulse(multiplyVector(direction, strengthMultiplier));
        }
    }
}, 1);

function multiplyVector(vector, scalar) {
    return { x: vector.x * scalar, y: vector.y * scalar, z: vector.z * scalar };
}

function subtractVector(vector1, vector2) {
    return { x: vector1.x - vector2.x, y: vector1.y - vector2.y, z: vector1.z - vector2.z };
}
