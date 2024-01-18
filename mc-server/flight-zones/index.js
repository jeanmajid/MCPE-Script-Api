import { system, world } from "@minecraft/server";

let flypos1 = { x: undefined, z: undefined };
let flypos2 = { x: undefined, z: undefined };

const flyAreas = [];

world.afterEvents.worldInitialize.subscribe(() => {
    const flyAreaIds = world.getDynamicPropertyIds().filter((id) => id.startsWith("jmfz:"));
    for (const id of flyAreaIds) {
        let data = world.getDynamicProperty(id);
        if (!data) {
            world.setDynamicProperty(id, undefined);
            continue;
        }
        data = data.split(":");
        flyAreas.push({ x1: data[0], z1: data[1], x2: data[2], z2: data[3] });
    }
});

world.beforeEvents.chatSend.subscribe((data) => {
    if (!data.sender.isOp()) return;
    if (!data.message.startsWith("!")) return;
    data.cancel = true;
    const command = data.message.split(/ /)[0].slice(1).toLowerCase();
    const args = data.message.split(/ /).slice(1);
    const player = data.sender;
    switch (command) {
        case "flyhelp":
            player.sendMessage("§eAvailable commands:");
            player.sendMessage("§7- §b!flypos1§7: Set the first flight position");
            player.sendMessage("§7- §b!flypos2§7: Set the second flight position");
            player.sendMessage("§7- §b!flyzone <name>§7: Create a flight zone with the specified name");
            player.sendMessage("§7- §b!flydelete <name>§7: Delete the flight zone with the specified name");
            player.sendMessage("§7- §b!flyshowall§7: Show all flight zones");
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
            flyAreas.push({ x1: flypos1.x, z1: flypos1.z, x2: flypos2.x, z2: flypos2.z });
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
        default:
            player.sendMessage("§cThis command does not exist");
            break;
    }
});

system.runInterval(() => {
    const players = world.getPlayers({ excludeGameModes: [1], tags: ["fly"] });
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        for (let j = 0; j < flyAreas.length; j++) {
            const flyArea = flyAreas[j];
            if (!isPlayerInBoxArea(player, { x: flyArea.x1, z: flyArea.z1 }, { x: flyArea.x2, z: flyArea.z2 })) {
                player.runCommandAsync("gamemode s");
                player.runCommandAsync("ability @s mayfly false");
                continue;
            }
            player.runCommandAsync("ability @s mayfly true");
            break;
        }
    }
}, 160);

function isPlayerInBoxArea(player, corner1, corner2) {
    const { x: x1, z: z1 } = corner1;
    const { x: x2, z: z2 } = corner2;
    const { x, z } = player.location;

    return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && z >= Math.min(z1, z2) && z <= Math.max(z1, z2);
}

function setFlyPose(flyPoseNum, coords) {
    const { x, z } = coords;
    if (flyPoseNum === 1) {
        flypos1 = { x: Math.round(x), z: Math.round(z) };
    } else {
        flypos2 = { x: Math.round(x), z: Math.round(z) };
    }
}
