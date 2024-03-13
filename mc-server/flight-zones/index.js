import { system, world } from "@minecraft/server";

let flypos1 = { x: undefined, z: undefined };
let flypos2 = { x: undefined, z: undefined };

const flyAreas = [];
let interval = 160;
let run = 0;

system.afterEvents.scriptEventReceive.subscribe((data) => {
    const player = data?.sourceEntity;
    if (!player) return;
    if (!data.id.startsWith("jm:")) return;
    const command = data.id.slice(3).toLowerCase();
    const args = data.message.split(/ /);
    switch (command) {
        case "flyhelp":
            player.sendMessage("§eAvailable commands:");
            player.sendMessage("§7- §b!flypos1§7: Set the first flight position");
            player.sendMessage("§7- §b!flypos2§7: Set the second flight position");
            player.sendMessage("§7- §b!flyzone <name>§7: Create a flight zone with the specified name");
            player.sendMessage("§7- §b!flydelete <name>§7: Delete the flight zone with the specified name");
            player.sendMessage("§7- §b!flyinterval <interval>§7: Set the interval in ticks for checking the flight zone");
            break;
        case "flypos1":
            setFlyPose(1, player.location);
            player.sendMessage(`§aThe first flight position has been set to x: ${flypos1.x} z: ${flypos1.z}`);
            break;
        case "flypos2":
            setFlyPose(2, player.location);
            player.sendMessage(`§aThe second flight position has been set to x: ${flypos2.x} z: ${flypos2.z}`);
            break;
        case "flyzone":
            if (!args[0] || !flypos1.x || !flypos2.x || !flypos1.z || !flypos2.z)
                return player.sendMessage("§cUse !flypos1 and !flypos2 to set the box positions, and then use !flyzone <name> to set the name of the zone");
            world.setDynamicProperty(`jmfz:${args[0]}`, `${flypos1.x}:${flypos1.z}:${flypos2.x}:${flypos2.z}`);
            const flyArea = { x1: flypos1.x, z1: flypos1.z, x2: flypos2.x, z2: flypos2.z };
            flyArea.minX = Math.min(flyArea.x1, flyArea.x2);
            flyArea.maxX = Math.max(flyArea.x1, flyArea.x2);
            flyArea.minZ = Math.min(flyArea.z1, flyArea.z2);
            flyArea.maxZ = Math.max(flyArea.z1, flyArea.z2);
            flyAreas.push(flyArea);
            player.sendMessage(`§aThe flight zone with the name ${args[0]} has been created. Positions: x1: ${flypos1.x}, z1: ${flypos1.z}, x2: ${flypos2.x}, z2: ${flypos2.z}`);
            break;
        case "flydelete":
            world.setDynamicProperty(`jmfz:${args[0]}`, undefined);
            player.sendMessage(`§aThe flight zone ${args[0]} has been successfully deleted`);
            break;
        case "flyshowall":
            world.getDynamicPropertyIds().forEach((id) => {
                if (!id.startsWith("jmfz:")) return;
                const data = world.getDynamicProperty(id);
                player.sendMessage(`§7${id} = ${data}`);
            });
            break;
        case "flyinterval":
            if (!args[0]) {
                player.sendMessage("§cSpecify an interval");
                return;
            }
            if (isNaN(args[0]) || args[0] <= 0 || args[0] > 500) {
                player.sendMessage("§cThe interval must be a positive number not greater than 500");
                return;
            }
            world.setDynamicProperty("jmfc:interval", args[0]);
            player.sendMessage(`§aSet the Fly zone check interval to ${args[0]}`);
            interval = parseInt(args[0]);
            registerInterval();
            break;
        default:
            player.sendMessage("§cThis command does not exist");
            break;
    }
});

const firstSpawn = world.afterEvents.playerSpawn.subscribe(() => {
    const worldDynPropIds = world.getDynamicPropertyIds();
    const flyAreaIds = worldDynPropIds.filter((id) => id.startsWith("jmfz:"));
    for (const id of flyAreaIds) {
        let data = world.getDynamicProperty(id);
        if (!data) {
            world.setDynamicProperty(id, undefined);
            continue;
        }
        data = data.split(":");
        const flyArea = { x1: data[0], z1: data[1], x2: data[2], z2: data[3] };
        flyArea.minX = Math.min(flyArea.x1, flyArea.x2);
        flyArea.maxX = Math.max(flyArea.x1, flyArea.x2);
        flyArea.minZ = Math.min(flyArea.z1, flyArea.z2);
        flyArea.maxZ = Math.max(flyArea.z1, flyArea.z2);
        flyAreas.push(flyArea);
    }
    const gamerules = ["sendcommandfeedback false"];
    for (const gamerule of gamerules) {
        world.getDimension("overworld").runCommandAsync(`gamerule ${gamerule}`);
    }
    const intervalDynProp = world.getDynamicProperty("jmfc:interval");
    if (intervalDynProp) interval = parseInt(intervalDynProp);
    world.afterEvents.playerSpawn.unsubscribe(firstSpawn);
});

function registerInterval() {
    system.clearRun(run);
    run = system.runInterval(() => {
        const players = world.getPlayers({ excludeGameModes: [1] });
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            for (let j = 0; j < flyAreas.length; j++) {
                const flyArea = flyAreas[j];
                if (!isPlayerInBoxArea(player, flyArea)) {
                    player.runCommandAsync("gamemode s");
                    player.runCommandAsync("ability @s mayfly false");
                    if (player.inF) {
                        player.sendMessage("§cYou left an flight zone. Fly mode has been disabled.");
                    }
                    player.inF = false;
                    continue;
                }
                player.runCommandAsync("ability @s mayfly true");
                if (!player.inF) {
                    player.sendMessage("§aYou entered an flight zone. Fly mode has been enabled.");
                }
                player.inF = true;
                break;
            }
        }
    }, interval);
}

function isPlayerInBoxArea(player, flyArea) {
    const { x, z } = player.location;
    return x >= flyArea.minX && x <= flyArea.maxX && z >= flyArea.minZ && z <= flyArea.maxZ;
}

function setFlyPose(flyPoseNum, coords) {
    const { x, z } = coords;
    if (flyPoseNum === 1) {
        flypos1 = { x: Math.round(x), z: Math.round(z) };
    } else {
        flypos2 = { x: Math.round(x), z: Math.round(z) };
    }
}

registerInterval();