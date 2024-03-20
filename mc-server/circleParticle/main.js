function generateCirclePoints(x, y, z, radius, space) {
    let points = [];
    for (let theta = Math.PI / 2; theta < 2 * Math.PI + Math.PI / 2; theta += space) {
        let pointX = x + radius * Math.cos(theta);
        let pointZ = z + radius * Math.sin(theta);
        points.push({ x: pointX, y: y, z: pointZ });
    }
    points.shift();
    return points;
}

function generateSpherePoints(x, y, z, radius, space) {
    let points = [];
    for (let theta = 0; theta < 2 * Math.PI; theta += space) {
        for (let phi = 0; phi < Math.PI; phi += space) {
            let pointX = x + radius * Math.sin(phi) * Math.cos(theta);
            let pointY = y + radius * Math.sin(phi) * Math.sin(theta);
            let pointZ = z + radius * Math.cos(phi);
            points.push({ x: pointX, y: pointY, z: pointZ });
        }
    }
    points = points.filter((p) => !compareVector(p, points[0]));
    return points;
}
function compareVector(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z;
}

// write the file to an mc function using an template
const fs = require("fs");

fs.writeFileSync("../functions/circle.mcfunction", "");

const CalcPoints = generateSpherePoints(0, -54, 0, 1, 0.5);

for (const point of CalcPoints) {
    fs.appendFileSync("../functions/circle.mcfunction", `particle minecraft:endrod ${point.x} ${point.y} ${point.z}\n`);
}
