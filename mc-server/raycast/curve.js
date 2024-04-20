import { system, world } from "@minecraft/server";

world.afterEvents.itemStartUse.subscribe(({ source }) => {
    source.interval = system.runInterval(() => {
        const target = getEntitiesInViewDirection(source);
        if (!target) return;
        const distance = distanceBetween(source.location, target.location);
        const p0 = { x: source.location.x, y: source.location.y + 1, z: source.location.z };
        const p1 = getLocationInFront(source, distance / 2);
        p1.y += 2;
        const p2 = target.location;
        p2.y += 1;
        const steps = Math.ceil(distance);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = bezier(p0, p1, p2, t);
            source.dimension.spawnParticle("minecraft:balloon_gas_particle", point);
        }

        target.runCommandAsync(`damage @s 1 override entity "${source.name}"`);
    });
});

world.afterEvents.itemStopUse.subscribe(({ source }) => {
    system.clearRun(source.interval);
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

function bezier(p0, p1, p2, t) {
    const intermediateA = lerp(p0, p1, t);
    const intermediateB = lerp(p1, p2, t);
    return lerp(intermediateA, intermediateB, t);
}

function getLocationInFront(player, distance) {
    const viewDirection = multiply(player.getViewDirection(), distance);
    return add(player.location, viewDirection);
}

function distanceBetween(vector1, vector2) {
    const vector = subtract(vector2, vector1);
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

function normalize(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    return {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length,
    };
}

function getEntitiesInViewDirection(player) {
    const vd = normalize(player.getViewDirection());
    const entities = player.dimension.getEntities({ families: ["mob"], location: player.location, maxDistance: 100 });
    for (let j = 0; j < entities.length; j++) {
        const entity = entities[j];
        const toEntity = normalize(subtract(entity.location, player.location));
        const dotProduct = vd.x * toEntity.x + vd.y * toEntity.y + vd.z * toEntity.z;
        if (dotProduct > 0.4) {
            return entities[j];
        }
    }
}
