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

import { system, world } from "@minecraft/server";

const strength = 2.5;
const vertical = 0.5;

system.runInterval(() => {
    const players = world.getPlayers({ excludeGameModes: ["creative"] });
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (!player.hasJumped && player.isOnGround) {
            player.runCommandAsync("ability @s mayfly true");
            player.hasJumped = true;
        }
        if (!player.isFlying) continue;
        player.hasJumped = false;
        player.runCommandAsync("gamemode s");
        player.runCommandAsync("ability @s mayfly false");
        const di = player.getViewDirection();
        player.applyKnockback(di.x, di.z, strength, di.y + vertical);
    }
});
