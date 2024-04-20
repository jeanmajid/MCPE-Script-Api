import { world } from "@minecraft/server";

world.afterEvents.itemUse.subscribe((data) => {
    const { source } = data;

    const ray = source.getBlockFromViewDirection({ maxDistance: 100 });
    if (!ray) return;
    const start = { x: source.location.x, y: source.location.y + 1, z: source.location.z };
    const end = ray.block.location;
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = lerp(start, end, t);
        source.dimension.spawnParticle("minecraft:redstone_repeater_dust_particle", point);
    }
});

function add(vector1, vector2) {
    return { x: vector1.x + vector2.x, y: vector1.y + vector2.y, z: vector1.z + vector2.z };
}

function subtract(vector1, vector2) {
    return { x: vector1.x - vector2.x, y: vector1.y - vector2.y, z: vector1.z - vector2.z };
}

function multiply(vector, scalar) {
    return { x: vector.x * scalar, y: vector.y * scalar, z: vector.z * scalar };
}

function lerp(start, end, t) {
    return add(start, multiply(subtract(end, start), t));
}
