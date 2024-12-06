import { system, world } from "@minecraft/server";

function subtractVectors(vector1, vector2) {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
        z: vector1.z - vector2.z,
    };
}

function normalizeVector(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    return {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length,
    };
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const vd = normalizeVector(player.getViewDirection());
        for (const entity of player.dimension.getEntities()) {
            const toEntity = normalizeVector(subtractVectors(entity.location, player.location));
            const dotProduct = vd.x * toEntity.x + vd.y * toEntity.y + vd.z * toEntity.z;
            if (dotProduct > 0.4) {
                player.sendMessage(`Entity ${entity.typeId} is in the field of view`);
            }
        }
    }
}, 5);
