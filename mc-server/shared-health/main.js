import { system, world } from "@minecraft/server";

let lastHealth = 20;

world.afterEvents.playerSpawn.subscribe((data) => {
    data.player.getComponent("health").setCurrentValue(lastHealth);
    world.getDimension("overworld").runCommandAsync("gamerule naturalregeneration false");
    world.getDimension("overworld").runCommandAsync("gamerule doimmediaterespawn true");
});

world.afterEvents.entityHealthChanged.subscribe(
    (data) => {
        if (data.entity.getComponent("health").currentValue === lastHealth) return;
        const players = world.getAllPlayers();
        for (let i = 0; i < players.length; i++) {
            players[i].getComponent("health").setCurrentValue(data.newValue);
            lastHealth = data.newValue;
        }
    },
    { entityTypes: ["minecraft:player"] }
);

world.afterEvents.entityDie.subscribe(
    (data) => {
        lastHealth = 20;
        data.deadEntity.getComponent("health").setCurrentValue(20);
    },
    { entityTypes: ["minecraft:player"] }
);

system.runInterval(() => {
    if (lastHealth > 19) return;
    lastHealth++;
    const players = world.getAllPlayers();
    for (let i = 0; i < players.length; i++) {
        players[i].getComponent("health").setCurrentValue(lastHealth);
    }
}, 60);
