import { existsSync, readFileSync } from "node:fs";

const campus = readFileSync(new URL("../app/lib/campus.ts", import.meta.url), "utf8");
const characters = readFileSync(
  new URL("../app/lib/characters.ts", import.meta.url),
  "utf8",
);

const periods = [...campus.matchAll(/id: "(arrival|class|lunch|afternoon|evening)"/g)].map(
  (match) => match[1],
);
const rooms = [...campus.matchAll(/id: "(quad|classroom|gym|dorm|library)"/g)].map(
  (match) => match[1],
);
const uniquePeriods = [...new Set(periods)];
const uniqueRooms = [...new Set(rooms)];

const blocks = campus.split(/periodId: "/).slice(1);
const placements = blocks.map((block) => {
  const periodId = /^(arrival|class|lunch|afternoon|evening)"/.exec(block)?.[1];
  const roomId = /roomId:\s*"(quad|classroom|gym|dorm|library)"/.exec(block)?.[1];
  const characterId = /characterId:\s*"([^"]+)"/.exec(block)?.[1];
  const greeting = /greeting:\s*(?:\n\s*)?"([^"]*)"/.exec(block)?.[1];
  if (!periodId || !roomId || !characterId || greeting === undefined) {
    throw new Error(`Unparsed placement block:\n${block.slice(0, 200)}`);
  }
  return { periodId, roomId, characterId, greeting };
});

const roster = [...characters.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]);

let failed = 0;
function check(ok, message) {
  if (!ok) {
    failed += 1;
    console.error(message);
  }
}

check(placements.length === 35, `expected 35 placements, got ${placements.length}`);
check(uniquePeriods.length === 5, `periods ${uniquePeriods.join(",")}`);
check(uniqueRooms.length === 5, `rooms ${uniqueRooms.join(",")}`);
check(roster.length === 7, `roster ${roster.length}`);

for (const periodId of uniquePeriods) {
  const inPeriod = placements.filter((placement) => placement.periodId === periodId);
  const seen = new Set();
  for (const placement of inPeriod) {
    check(!seen.has(placement.characterId), `${placement.characterId} twice in ${periodId}`);
    seen.add(placement.characterId);
  }
  check(seen.size === roster.length, `${periodId} has ${seen.size} characters`);
  for (const roomId of uniqueRooms) {
    check(
      inPeriod.some((placement) => placement.roomId === roomId),
      `${periodId} / ${roomId} is empty`,
    );
  }
}

for (const placement of placements) {
  check(roster.includes(placement.characterId), `unknown ${placement.characterId}`);
  check(
    placement.greeting.length > 0 && placement.greeting.length <= 200,
    `${placement.characterId} ${placement.periodId} greeting ${placement.greeting.length}`,
  );
}

for (const id of roster) {
  check(existsSync(new URL(`../public/characters/${id}.jpg`, import.meta.url)), `missing portrait ${id}`);
}

check(campus.includes("export const QUIZ"), "quiz missing");

if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log(`campus ok: ${placements.length} placements, ${roster.length} characters`);
