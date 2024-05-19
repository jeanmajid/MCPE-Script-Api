import { system, world } from "@minecraft/server";

world.afterEvents.itemStartUse.subscribe((data) => {
    switch (data.itemStack.typeId) {
        case "minecraft:bow":
            shootProjectile(data.source, "arrow", 1000, 0);
            break;
        case "bow:bow":
            shootProjectile(data.source, "arrow", 20, 5);
            break;
        case "bow:bow2":
            shootProjectile(data.source, "projectile:projectile", 20, 5);
            break;
        case "bow:bow3":
            shootProjectile(data.source, "projectile:projectile", 20, 5);
            break;
    }
});

world.afterEvents.itemStopUse.subscribe((data) => {
    if (data.source.gunInterval) {
        system.clearRun(data.source.gunInterval);
        data.source.gunIntervali = null;
    }
});

function shootProjectile(player, projectile, strength, shootInterval) {
    player.gunInterval = system.runInterval(() => {
        const viewDirection = player.getViewDirection();
        const shootpos = player.location;
        shootpos.y += 1.8;
        const arrow = player.dimension.spawnEntity(projectile, locationInfront(shootpos, { x: viewDirection.x, y: viewDirection.y - 0.25, z: viewDirection.z }, 0.3));
        const rot = player.getRotation();
        rot.y *= -1;
        rot.x *= -1;
        arrow.setRotation(rot);
        launchEntityInDirection(arrow, viewDirection, strength);
    }, shootInterval);
}

function getNormalizedVector(vector) {
    const length = Math.hypot(vector.x, vector.y, vector.z);
    return {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length,
    };
}

function locationInfront(location, direction, distance) {
    return {
        x: location.x + direction.x * distance,
        y: location.y + direction.y * distance,
        z: location.z + direction.z * distance,
    };
}

function launchEntityInDirection(entity, viewDirection, speed) {
    const normalizedViewDir = getNormalizedVector(viewDirection);
    const impulse = {
        x: speed * normalizedViewDir.x,
        y: speed * normalizedViewDir.y,
        z: speed * normalizedViewDir.z,
    };
    entity.applyImpulse(impulse);
}
