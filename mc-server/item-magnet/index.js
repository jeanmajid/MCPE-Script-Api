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

import { world, system, Vector } from "@minecraft/server";

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
            const direction = Vector.subtract(location, entity.location);
            direction.y += 1;
            entity.applyImpulse(Vector.multiply(direction, strengthMultiplier));
        }
    }
}, 1);
