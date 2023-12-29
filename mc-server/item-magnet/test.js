import { ItemStack, world } from "@minecraft/server";

export function spawnRandomItems(amount, rangeFromZero) {
    for (let i = 0; i < amount; i++) {
        try {
        world.getDimension("overworld").spawnItem(new ItemStack("stone"), { x: Math.floor(Math.random() * rangeFromZero), y: -50, z: Math.floor(Math.random() * rangeFromZero) });
        } catch (_) {
            // errors are not needed
        }
    }
}