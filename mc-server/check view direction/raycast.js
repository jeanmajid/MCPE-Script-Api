import { system, world } from "@minecraft/server";

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const entities = player.getEntitiesFromViewDirection({ maxDistance: 100 });
        player.sendMessage(`your looking at these entities: ${entities.map((e) => e.entity.typeId).join(",")} they are ${entities.map((e) => e.distance).join(",")} blocks away`);
    }
}, 5);
