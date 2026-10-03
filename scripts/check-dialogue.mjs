import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const data = JSON.parse(read("../app/lib/first-morning.json"));
const campus = read("../app/lib/campus.ts");
const roster = read("../app/lib/characters.ts");

let failed = 0;
function check(ok, message) {
  if (!ok) {
    failed += 1;
    console.error(message);
  }
}

const TEACHERS = ["helena-ward", "marcus-hale", "abel-crowe"];
const STUDENTS = [
  "sloane-vickers",
  "priya-nayak",
  "ellis-cho",
  "jordan-peck",
  "willa-crane",
];
const ids = data.characters.map((c) => c.id);
check(ids.length === 8, `expected 8 characters, got ${ids.length}`);
check(new Set(ids).size === ids.length, "duplicate character id");
for (const id of TEACHERS)
  check(data.characters.find((c) => c.id === id)?.kind === "teacher", `${id} not a teacher`);
for (const id of STUDENTS)
  check(data.characters.find((c) => c.id === id)?.kind === "student", `${id} not a student`);
check(
  ids.every((id) => [...TEACHERS, ...STUDENTS].includes(id)),
  `unexpected id in ${ids.join(",")}`,
);

const rosterIds = [...roster.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
check(
  data.roster.existing.every((id) => rosterIds.includes(id)) &&
    data.roster.existing.length === rosterIds.length,
  "roster.existing drifted from characters.ts",
);
check(data.roster.added.length === 1 && data.roster.added[0].id === "willa-crane", "only Willa may be added");
check(
  !rosterIds.includes("willa-crane"),
  "Willa is now in characters.ts; remove roster.added and read her from there",
);
const willa = data.roster.added[0];
for (const key of ["id", "name", "role", "portrait", "persona", "greeting", "voice"])
  check(typeof willa[key] === "string" && willa[key].length > 0, `willa.${key} missing`);

// Existing morning placements and choices must be preserved.
const arrival = campus
  .split(/periodId: "/)
  .slice(1)
  .filter((block) => block.startsWith('arrival"'))
  .map((block) => ({
    characterId: /characterId:\s*"([^"]+)"/.exec(block)[1],
    roomId: /roomId:\s*"([^"]+)"/.exec(block)[1],
    greeting: /greeting:\s*(?:\n\s*)?"([^"]*)"/.exec(block)[1],
    choices: [...block.matchAll(/label:\s*"([^"]*)",\s*say:\s*"([^"]*)"/g)].map((m) => ({
      label: m[1],
      say: m[2],
    })),
  }));

const PRIYA_GREETING = "Hi. I'm Priya. This chair was empty. It still is, if you want it.";

for (const character of data.characters) {
  const { id, dialogue } = character;
  const nodes = dialogue.nodes;
  check(nodes[dialogue.start], `${id}: missing start node`);
  check(dialogue.exit?.label && dialogue.exit.say && dialogue.exit.line, `${id}: exit incomplete`);

  const root = nodes[dialogue.start];
  check(root.line.length > 0 && root.line.length <= 200, `${id}: root line length`);

  const existing = arrival.find((entry) => entry.characterId === id);
  if (existing) {
    check(character.room === existing.roomId, `${id}: room ${character.room} != ${existing.roomId}`);
    if (id !== "priya-nayak")
      check(root.line === existing.greeting, `${id}: greeting differs from campus.ts arrival`);
    for (const choice of existing.choices)
      check(
        root.choices.some((c) => c.label === choice.label && c.say === choice.say),
        `${id}: lost existing choice "${choice.label}"`,
      );
  } else {
    check(id === "willa-crane", `${id}: no arrival placement`);
  }

  for (const [nodeId, node] of Object.entries(nodes)) {
    const where = `${id}/${nodeId}`;
    check(typeof node.line === "string" && node.line.length > 0, `${where}: empty line`);
    check(node.choices.length <= 3, `${where}: more than three choices`);
    if (node.end) check(node.choices.length === 0, `${where}: end node has choices`);
    else check(node.choices.length >= 1, `${where}: dead end without end flag`);
    for (const choice of node.choices) {
      check(nodes[choice.next], `${where}: next "${choice.next}" does not exist`);
      check(choice.label.length > 0 && choice.label.length <= 28, `${where}: label length "${choice.label}"`);
      check(choice.say.length > 0 && choice.say.length <= 120, `${where}: say length`);
      check(!("freeText" in choice) && !("mic" in choice), `${where}: free input`);
    }
  }

  // Walk every path: depth in NPC beats after the greeting, plus reachability.
  const reached = new Set();
  const leafDepths = [];
  function walk(nodeId, depth, trail) {
    check(!trail.includes(nodeId), `${id}: cycle at ${nodeId}`);
    reached.add(nodeId);
    const node = nodes[nodeId];
    if (node.end) {
      leafDepths.push(depth);
      return;
    }
    for (const choice of node.choices) walk(choice.next, depth + 1, [...trail, nodeId]);
  }
  walk(dialogue.start, 0, []);
  for (const nodeId of Object.keys(nodes))
    check(reached.has(nodeId), `${id}: unreachable node ${nodeId}`);
  check(leafDepths.length >= 3, `${id}: only ${leafDepths.length} paths`);
  check(
    leafDepths.every((d) => d >= 2 && d <= 3),
    `${id}: path depth out of 2-3 beats: ${leafDepths.join(",")}`,
  );
  check(
    new Set(root.choices.map((c) => c.next)).size === root.choices.length,
    `${id}: root choices share a target`,
  );
}

const priya = data.characters.find((c) => c.id === "priya-nayak").dialogue.nodes.root;
check(priya.line === PRIYA_GREETING, "Priya greeting changed");
check(
  roster.includes(`greeting: "${PRIYA_GREETING}"`),
  "Priya greeting in characters.ts changed",
);
check(
  priya.choices.length === 2 &&
    priya.choices[0].label === "Is this seat free" &&
    priya.choices[1].label === "What are you reading",
  "Priya must keep exactly her two talk choices",
);

const ward = data.characters.find((c) => c.id === "helena-ward").dialogue.nodes;
check(
  ward.q1.choices.some((c) => c.label === "1847" && c.next === "q1-right"),
  "Ward's 1847 beat missing",
);

if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
const paths = data.characters.map((c) => `${c.id}`).join(", ");
console.log(`dialogue ok: ${data.characters.length} characters (${paths})`);
