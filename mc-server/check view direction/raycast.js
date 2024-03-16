import { system, world } from "@minecraft/server";

system.runInterval(() => {
    const players = world.getAllPlayers();
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const entities = player.getEntitiesFromViewDirection({ maxDistance: 100 });
        for (let j = 0; j < entities.length; j++) {
            player.sendMessage(`your looking at these entities: ${entities.map((e) => e.entity.typeId).join(",")} they are ${entities.map((e) => e.distance).join(",")} blocks away`);
        }
    }
}, 5);
