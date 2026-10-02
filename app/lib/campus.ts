// Day one at Alden Hall, as data a later day can replace.
//
// `PLACEMENTS` is a fixed schedule: each period, each character stands in
// one room. A later day can swap this array for a generated one of the same
// shape — period, room, character, scene — and the map, the room list, and
// the call flow stay put. Nothing here talks to Reactor.

import {
  characterById,
  type Character,
} from "./characters";

export type RoomId = "quad" | "classroom" | "gym" | "dorm" | "library";
export type PeriodId = "arrival" | "class" | "lunch" | "afternoon" | "evening";

export interface Room {
  id: RoomId;
  name: string;
  blurb: string;
  /** Percentages of the campus frame. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Period {
  id: PeriodId;
  label: string;
  time: string;
  narration: string;
}

export interface BeatChoice {
  /** Short label on the button. */
  label: string;
  /** Spoken line sent with `say`. */
  say: string;
}

export interface Placement {
  periodId: PeriodId;
  roomId: RoomId;
  characterId: string;
  /** One line on the room card. */
  presence: string;
  /** Folded into the persona for this visit. */
  scene: string;
  /** First thing they say. Must stay within the model's 200-character greeting limit. */
  greeting: string;
  choices: ReadonlyArray<BeatChoice>;
}

export interface QuizChoice {
  label: string;
  say: string;
}

export interface QuizQuestion {
  prompt: string;
  choices: ReadonlyArray<QuizChoice>;
}

export const ROOMS: ReadonlyArray<Room> = [
  {
    id: "library",
    name: "Library",
    blurb: "Carrels, a mezzanine, and a whisper rule nobody has explained yet.",
    x: 6,
    y: 7,
    w: 30,
    h: 30,
  },
  {
    id: "classroom",
    name: "Classroom",
    blurb: "History. The desks still carry last year's initials.",
    x: 64,
    y: 7,
    w: 30,
    h: 30,
  },
  {
    id: "quad",
    name: "Quad",
    blurb: "Founders' Quad. The oldest grass, and the newest gossip.",
    x: 33,
    y: 34,
    w: 34,
    h: 30,
  },
  {
    id: "gym",
    name: "Gymnasium",
    blurb: "The cage, the floor, and a clock that runs fast.",
    x: 6,
    y: 64,
    w: 34,
    h: 28,
  },
  {
    id: "dorm",
    name: "Dorm",
    blurb: "North House common room. The radiator ticks whether or not it is on.",
    x: 58,
    y: 64,
    w: 36,
    h: 28,
  },
];

export const PERIODS: ReadonlyArray<Period> = [
  {
    id: "arrival",
    label: "Morning arrival",
    time: "7:40",
    narration:
      "The cab has gone. Your trunk is on the North House steps, and the first bell has not rung.",
  },
  {
    id: "class",
    label: "Mid-morning class",
    time: "9:10",
    narration:
      "Second bell. Dr. Ward's door is open, and the hallway smells like chalk.",
  },
  {
    id: "lunch",
    label: "Lunch",
    time: "12:05",
    narration:
      "The dining hall is loud. The quad is where people actually decide who you are.",
  },
  {
    id: "afternoon",
    label: "Afternoon gym",
    time: "2:20",
    narration:
      "Athletics is required on paper. On the floor, Coach Hale is already counting.",
  },
  {
    id: "evening",
    label: "Evening dorm",
    time: "8:15",
    narration:
      "Lights-out is later than you think and earlier than you want. North House is still awake.",
  },
];

/**
 * Placement quiz in Dr. Ward's classroom. The buttons are the student's
 * lines; she hears them through `say` and answers in the call. Not a
 * separate game.
 */
export const QUIZ: ReadonlyArray<QuizQuestion> = [
  {
    prompt: "In what year was Alden Hall chartered?",
    choices: [
      { label: "1847", say: "The charter year is 1847." },
      { label: "1776", say: "I think the school was chartered in 1776." },
      { label: "1964", say: "I'd guess 1964." },
    ],
  },
  {
    prompt: "What is cut into the chapel lintel?",
    choices: [
      {
        label: "Steadfast in small things",
        say: "The lintel says, Steadfast in small things.",
      },
      { label: "Lux et veritas", say: "I think the lintel says lux et veritas." },
      { label: "Dare to be wise", say: "Maybe it says, dare to be wise." },
    ],
  },
  {
    prompt: "Which quad is the oldest?",
    choices: [
      { label: "Founders' Quad", say: "The oldest quad is Founders' Quad." },
      {
        label: "The playing fields",
        say: "I think the oldest ground is the playing fields.",
      },
      {
        label: "North House lawn",
        say: "Is it the lawn behind North House?",
      },
    ],
  },
];

export const PLACEMENTS: ReadonlyArray<Placement> = [
  // Morning arrival
  {
    periodId: "arrival",
    roomId: "quad",
    characterId: "sloane-vickers",
    presence: "Watching the new arrivals like weather.",
    scene:
      "It is early. You are on Founders' Quad, deciding whether this new student is worth a minute. Give them one unwritten rule of Alden Hall.",
    greeting: "New, and already on the quad. I'm Sloane. Stay a minute.",
    choices: [
      {
        label: "The unwritten rule",
        say: "I'm new. What's the one rule nobody writes down?",
      },
      {
        label: "Where to stand",
        say: "Where am I supposed to be before the first bell?",
      },
    ],
  },
  {
    periodId: "arrival",
    roomId: "quad",
    characterId: "abel-crowe",
    presence: "Raking the edge of the path, not the grass.",
    scene:
      "You are on the quad with a rake. A new student looks lost. Point them: North House is behind the beeches, chapel to the east.",
    greeting: "Lost already. That's traditional. I'm Crowe. Chapel's the other way.",
    choices: [
      {
        label: "Which path",
        say: "I think I'm lost. Which path is actually the quad?",
      },
      {
        label: "How long",
        say: "How long have you kept these grounds?",
      },
    ],
  },
  {
    periodId: "arrival",
    roomId: "classroom",
    characterId: "helena-ward",
    presence: "Writing the date on the board before anyone arrives.",
    scene:
      "You are in your classroom before the bell, and a new student has wandered in. You can start the placement now or tell them when to come back. Prefer to start if they stay.",
    greeting:
      "You're early, which I prefer. Three questions. What year was Alden Hall chartered?",
    choices: [
      {
        label: "What is this class",
        say: "I just got here. What does this class actually want from me?",
      },
      {
        label: "Where do I sit",
        say: "Where should I sit when the room fills?",
      },
    ],
  },
  {
    periodId: "arrival",
    roomId: "gym",
    characterId: "marcus-hale",
    presence: "Unlocking the equipment cage.",
    scene:
      "You are opening the gym before anyone is required to be here. A new student walked in. Tell them afternoon session is the one that counts, and ask what they've played.",
    greeting: "Gym's not open for hiding yet. I'm Hale. You lost, or you early?",
    choices: [
      {
        label: "I've never played",
        say: "I've never really played a school sport. Where do I start?",
      },
      {
        label: "Is today required",
        say: "Is the afternoon session required on the first day?",
      },
    ],
  },
  {
    periodId: "arrival",
    roomId: "dorm",
    characterId: "ellis-cho",
    presence: "Sitting on a trunk that might be yours.",
    scene:
      "You are in the North House common room on the first morning, having just met your roommate. The top bunk is negotiable. You are both new.",
    greeting: "Hey. I'm Ellis. I took the top bunk. We can negotiate.",
    choices: [
      {
        label: "Keep the top",
        say: "Keep the top bunk. What time is the first bell?",
      },
      {
        label: "Where is assembly",
        say: "Do you know where morning assembly actually is?",
      },
    ],
  },
  {
    periodId: "arrival",
    roomId: "dorm",
    characterId: "jordan-peck",
    presence: "Holding a ring of room keys and a clipboard.",
    scene:
      "You are the RA in the common room, checking new students in. This one still needs a key. Lights-out is eleven. Their trunk may be on the steps.",
    greeting: "North House. I'm Jordan. You want the key, or the bad news first?",
    choices: [
      {
        label: "The key",
        say: "I don't have a room key yet.",
      },
      {
        label: "Lights-out",
        say: "What time is lights-out, really?",
      },
    ],
  },
  {
    periodId: "arrival",
    roomId: "library",
    characterId: "priya-nayak",
    presence: "Already in a carrel, as if she never arrived.",
    scene:
      "You came to the library before breakfast because the quad was too many people. A new student found you. Offer them the quiet, and one fact about today.",
    greeting: "Oh. Hi. I'm Priya. I was saving this chair, but not from you.",
    choices: [
      {
        label: "Is this seat free",
        say: "Is this seat free, or are you saving it for someone braver?",
      },
      {
        label: "What are you reading",
        say: "What are you reading?",
      },
    ],
  },

  // Mid-morning class
  {
    periodId: "class",
    roomId: "quad",
    characterId: "abel-crowe",
    presence: "Telling a delivery van it cannot drive on the grass.",
    scene:
      "Class has started. You are still on the quad, keeping a van off the lawn. If a student is out of class, point them toward Ward without scolding them yourself.",
    greeting: "Bell went. If you're looking for history, it's the door with the light on.",
    choices: [
      {
        label: "I'm late",
        say: "I'm already late. Which door is Dr. Ward's?",
      },
      {
        label: "The grass",
        say: "Why does everyone treat the grass like it can hear us?",
      },
    ],
  },
  {
    periodId: "class",
    roomId: "classroom",
    characterId: "helena-ward",
    presence: "Waiting with the placement, not a lecture.",
    scene:
      "Class has begun. Give the placement quiz aloud, one question at a time. Do not move on until they answer the one you just asked.",
    greeting:
      "Sit. Three questions, then I place you. In what year was Alden Hall chartered?",
    choices: [
      {
        label: "What is this class",
        say: "Before the questions: what does this class actually grade?",
      },
      {
        label: "Where do I sit",
        say: "Where do you want me to sit?",
      },
    ],
  },
  {
    periodId: "class",
    roomId: "classroom",
    characterId: "priya-nayak",
    presence: "Second row, already writing the date.",
    scene:
      "You are in Dr. Ward's class, second row. A new student is choosing a seat. Whisper, practically: Ward likes short answers, and the quiz is aloud.",
    greeting: "Second row is safer. She can see the back, and she uses it.",
    choices: [
      {
        label: "Sit here",
        say: "Can I sit here? I don't know how this class works yet.",
      },
      {
        label: "The quiz",
        say: "Is the placement something I can fail on the first day?",
      },
    ],
  },
  {
    periodId: "class",
    roomId: "classroom",
    characterId: "ellis-cho",
    presence: "One row behind you, pretending to have a pen.",
    scene:
      "You are in history, slightly unprepared, glad to see your roommate. Share a pen if asked. You are nervous about being called on.",
    greeting: "You made it. I was going to save you a seat and then I got scared.",
    choices: [
      {
        label: "Save me a seat",
        say: "Save me the seat. Do you have a pen I can borrow?",
      },
      {
        label: "Have you had her",
        say: "Have you had Dr. Ward before, or are we both new at this?",
      },
    ],
  },
  {
    periodId: "class",
    roomId: "gym",
    characterId: "marcus-hale",
    presence: "Marking the floor for this afternoon.",
    scene:
      "You are in the gym during class period, setting up. If a student is here instead of class, send them back kindly and tell them when to return.",
    greeting: "This is not your class. Come back at two. I'll pretend I didn't see you.",
    choices: [
      {
        label: "I'll come back",
        say: "I'll come back at two. What should I wear?",
      },
      {
        label: "What do we play",
        say: "What are we actually playing this afternoon?",
      },
    ],
  },
  {
    periodId: "class",
    roomId: "dorm",
    characterId: "jordan-peck",
    presence: "Sorting mail that is mostly for other people.",
    scene:
      "You are in the common room during class, which means this student may be avoiding class. Ask once, then help if they are lost rather than hiding.",
    greeting: "Mail's mostly not yours. Shouldn't you be in a room with a teacher?",
    choices: [
      {
        label: "I got turned around",
        say: "I got turned around on the way to history. Which way is the classroom?",
      },
      {
        label: "Any mail",
        say: "Is any of that mail actually for me?",
      },
    ],
  },
  {
    periodId: "class",
    roomId: "library",
    characterId: "sloane-vickers",
    presence: "Skipping, and not pretending otherwise.",
    scene:
      "You are in the library during class, on purpose. If the new student is also out, don't recruit them to skip. Tell them Ward notices absences and the quiz is short.",
    greeting: "I'm not your example. If Ward's taking attendance, you should be in that chair, not this one.",
    choices: [
      {
        label: "Why are you here",
        say: "Why are you in the library if class already started?",
      },
      {
        label: "Walk me over",
        say: "Walk me as far as the classroom door?",
      },
    ],
  },

  // Lunch
  {
    periodId: "lunch",
    roomId: "quad",
    characterId: "sloane-vickers",
    presence: "Holding court on the chapel steps.",
    scene:
      "It is lunch. You are on the quad with people watching. Tell the new student where to sit, and one person worth knowing. Do not make them perform.",
    greeting: "Lunch is a seating chart nobody prints. Come here. I'll point.",
    choices: [
      {
        label: "Where do I sit",
        say: "Where should I sit at lunch if I don't want to get it wrong?",
      },
      {
        label: "Who matters",
        say: "Who should I actually talk to today, besides you?",
      },
    ],
  },
  {
    periodId: "lunch",
    roomId: "quad",
    characterId: "ellis-cho",
    presence: "Holding two apples and no plan.",
    scene:
      "You are on the quad at lunch with your roommate. You don't know where to sit either. Suggest you go in together.",
    greeting: "I took two apples because I panicked. We can go in together, if you want.",
    choices: [
      {
        label: "Go in together",
        say: "Let's go in together. I don't want to pick a table alone.",
      },
      {
        label: "How was class",
        say: "How was Ward's class for you, honestly?",
      },
    ],
  },
  {
    periodId: "lunch",
    roomId: "quad",
    characterId: "priya-nayak",
    presence: "Eating on the low wall, away from the steps.",
    scene:
      "You are eating lunch on the low wall, not on the steps. If they sit, make room. Mention that the library is quieter after lunch if the quad is too much.",
    greeting: "You can sit. The steps are louder than they look.",
    choices: [
      {
        label: "Sit with you",
        say: "Can I sit with you? The steps look like a test.",
      },
      {
        label: "After lunch",
        say: "Where do you go after lunch, if you want the day to get quieter?",
      },
    ],
  },
  {
    periodId: "lunch",
    roomId: "classroom",
    characterId: "helena-ward",
    presence: "Office hours, whether or not anyone planned them.",
    scene:
      "It is lunch. You are still in the classroom for anyone who missed the placement. Offer the three questions if they have not finished them.",
    greeting:
      "Office hours, whether you planned them or not. If you missed the placement, we start now. The year?",
    choices: [
      {
        label: "I missed it",
        say: "I missed the placement this morning. Can I take it now?",
      },
      {
        label: "What you grade",
        say: "What do you actually care about in this class, besides the date?",
      },
    ],
  },
  {
    periodId: "lunch",
    roomId: "gym",
    characterId: "marcus-hale",
    presence: "Eating standing up, which he recommends against.",
    scene:
      "You are in the gym at lunch, eating quickly. Remind them afternoon session is soon. Ask one question about what they can do today, not their whole history.",
    greeting: "Eat sitting down. I don't. Be here at two anyway.",
    choices: [
      {
        label: "What to bring",
        say: "What should I bring to the afternoon session?",
      },
      {
        label: "If I'm bad",
        say: "What happens if I'm bad at whatever you're running?",
      },
    ],
  },
  {
    periodId: "lunch",
    roomId: "dorm",
    characterId: "jordan-peck",
    presence: "Guarding the good mugs.",
    scene:
      "You are in the common room at lunch. Tell them the dining hall line is shorter if they go now, and that their key works on the side door.",
    greeting: "If you're hiding from the dining hall, the line is shorter in ten minutes. Not that I blame you.",
    choices: [
      {
        label: "The side door",
        say: "Does my key work on the side door, or only the front?",
      },
      {
        label: "The line",
        say: "Is the dining hall survivable if I go in with someone?",
      },
    ],
  },
  {
    periodId: "lunch",
    roomId: "library",
    characterId: "abel-crowe",
    presence: "Reading the paper by the radiator, on his break.",
    scene:
      "You are on a break in the library, which you are allowed to do. If they are lost between lunch and class, give them the afternoon in one sentence: gym at two, quad if they need air.",
    greeting: "Even the grass gets a lunch. You look like you need the map again.",
    choices: [
      {
        label: "The afternoon",
        say: "What happens this afternoon if I follow the day correctly?",
      },
      {
        label: "A first day",
        say: "What was your first day here like, if you remember it?",
      },
    ],
  },

  // Afternoon gym
  {
    periodId: "afternoon",
    roomId: "quad",
    characterId: "abel-crowe",
    presence: "Watching people cut across the corner.",
    scene:
      "It is afternoon. People are crossing the quad toward the gym. You are defending the corner of the lawn. Point the new student to the gym door, not across the grass.",
    greeting: "Gym's the long way, on the path. The grass is not a shortcut I recognize.",
    choices: [
      {
        label: "The long way",
        say: "Show me the long way to the gym. I'll stay off the grass.",
      },
      {
        label: "After sports",
        say: "When sports ends, which path gets me back to North House?",
      },
    ],
  },
  {
    periodId: "afternoon",
    roomId: "classroom",
    characterId: "helena-ward",
    presence: "Still here, if the placement is unfinished.",
    scene:
      "Afternoon. You are in the classroom with the board still up. If they still owe you the placement, take it. If they already finished, tell them their form in one sentence and send them to the gym.",
    greeting: "The board is still up. If you owe me the placement, we do it before you run.",
    choices: [
      {
        label: "I still owe it",
        say: "I still owe you the placement. Can we do it before gym?",
      },
      {
        label: "Send me to gym",
        say: "If we're done, tell me I'm allowed to go to the gym.",
      },
    ],
  },
  {
    periodId: "afternoon",
    roomId: "gym",
    characterId: "marcus-hale",
    presence: "Whistle in his hand, not yet using it.",
    scene:
      "Afternoon session. You are running a simple first-day circuit, not a tryout. Put the new student on something they can finish. Praise one specific effort.",
    greeting: "You're on time. That's the whole test. Tell me what you can do for ten minutes.",
    choices: [
      {
        label: "Start me small",
        say: "Start me on something small. I don't want to invent a sport today.",
      },
      {
        label: "Where do I stand",
        say: "Where do you want me to stand so I'm not in someone's way?",
      },
    ],
  },
  {
    periodId: "afternoon",
    roomId: "gym",
    characterId: "sloane-vickers",
    presence: "Stretching, already knowing the drill.",
    scene:
      "You are at afternoon athletics, competent and a little bored. Help the new student look like they belong for the next ten minutes. One concrete tip.",
    greeting: "Stand on my left. Hale notices the people who hover by the door.",
    choices: [
      {
        label: "Your left",
        say: "I'll stand on your left. What are we actually doing?",
      },
      {
        label: "Don't let me drown",
        say: "If I look lost out there, will you tell me before he does?",
      },
    ],
  },
  {
    periodId: "afternoon",
    roomId: "gym",
    characterId: "ellis-cho",
    presence: "Tying a shoe that was already tied.",
    scene:
      "You are at the gym with your roommate, equally new. You are willing to be bad at this together. Suggest you pair up.",
    greeting: "If we pair up, he can only be disappointed in us as a unit.",
    choices: [
      {
        label: "Pair up",
        say: "Let's pair up. I'd rather be bad at this with you.",
      },
      {
        label: "How bad",
        say: "How bad is this going to be, honestly?",
      },
    ],
  },
  {
    periodId: "afternoon",
    roomId: "dorm",
    characterId: "jordan-peck",
    presence: "Writing the lights-out reminder nobody will read.",
    scene:
      "You are in the dorm during athletics. If this student is here, they may be skipping. Tell them Hale takes attendance in his head, then offer water and the side door for when they come back.",
    greeting: "Gym's that way. I can tell Hale you were brave, but I won't tell him you were here.",
    choices: [
      {
        label: "I'm going",
        say: "I'm going. Which door puts me closest to the gym?",
      },
      {
        label: "If I come back wrecked",
        say: "If I come back wrecked, is there anywhere in the house to sit that isn't the hallway?",
      },
    ],
  },
  {
    periodId: "afternoon",
    roomId: "library",
    characterId: "priya-nayak",
    presence: "Back in the carrel, sports excused on paper she hopes.",
    scene:
      "You are in the library during athletics because you have an excuse you do not want to perform. If they are supposed to be at the gym, tell them to go, and that you will be here after.",
    greeting: "I'm allowed to be here. You're probably not. Hale is nicer if you're only a little late.",
    choices: [
      {
        label: "Come with me",
        say: "Come to the gym with me? I don't want to walk in alone.",
      },
      {
        label: "Find you after",
        say: "If I survive it, can I find you here after?",
      },
    ],
  },

  // Evening dorm
  {
    periodId: "evening",
    roomId: "quad",
    characterId: "abel-crowe",
    presence: "Locking the side gates for the night.",
    scene:
      "Evening. You are locking the far gates. Tell the new student the quad is closed to wandering, North House is still open, and the first day counts as survived.",
    greeting: "Gates are closing. You made it to evening. That's the whole first day, nearly.",
    choices: [
      {
        label: "Which way home",
        say: "Which way is North House from here, now that it's dark?",
      },
      {
        label: "Did I do it right",
        say: "Did I do the first day right, from where you're standing?",
      },
    ],
  },
  {
    periodId: "evening",
    roomId: "classroom",
    characterId: "helena-ward",
    presence: "Collecting the board, still willing to place you.",
    scene:
      "Evening. You are closing the classroom. If the placement is done, tell them their form and send them to the dorm. If not, you will still hear three short answers.",
    greeting: "I'm closing the room. If you still owe me three answers, give them to me standing up.",
    choices: [
      {
        label: "Place me",
        say: "Place me before you close the room. I'll answer whatever is left.",
      },
      {
        label: "What tomorrow is",
        say: "What should I have read, or understood, before tomorrow?",
      },
    ],
  },
  {
    periodId: "evening",
    roomId: "gym",
    characterId: "marcus-hale",
    presence: "Locking the cage, in a better mood than at two.",
    scene:
      "You are locking the equipment cage. The session is over. Tell them one thing they did that was enough, and that tomorrow is the same time.",
    greeting: "You stayed. That's what I write down. Tomorrow, same floor, less wandering.",
    choices: [
      {
        label: "Was that enough",
        say: "Was that enough for a first day, or do I owe you something?",
      },
      {
        label: "Tomorrow",
        say: "What should I do differently tomorrow?",
      },
    ],
  },
  {
    periodId: "evening",
    roomId: "dorm",
    characterId: "ellis-cho",
    presence: "On the couch, shoes finally off.",
    scene:
      "Evening in the common room. You are decompressing with your roommate. Ask about one part of their day, and admit one part of yours. Suggest the top bunk stays as it is unless they object.",
    greeting: "Shoes off. That's the rule I just invented. How bad was the rest of it?",
    choices: [
      {
        label: "The day",
        say: "The day was a lot. How was yours, actually?",
      },
      {
        label: "The bunks",
        say: "The bunks can stay as they are. Are you going to be able to sleep?",
      },
    ],
  },
  {
    periodId: "evening",
    roomId: "dorm",
    characterId: "jordan-peck",
    presence: "On the arm of a chair, done enforcing for a minute.",
    scene:
      "Evening check-in. Lights-out is eleven, you are not a cop about it tonight, and you want to know if they have a key, a bed, and one person they can find in the morning.",
    greeting: "Eleven is lights-out. Tonight I'll pretend the common room is a courtesy. You all right?",
    choices: [
      {
        label: "I'm all right",
        say: "I'm all right. I have a key and a bed. Is that the whole checklist?",
      },
      {
        label: "Who to find",
        say: "If I get lost again in the morning, who should I look for first?",
      },
    ],
  },
  {
    periodId: "evening",
    roomId: "dorm",
    characterId: "sloane-vickers",
    presence: "Visiting North House, which she does not live in.",
    scene:
      "You stopped by North House in the evening, which is allowed for a senior and slightly unusual. Tell the new student they got through the day, and give them one thing to do before breakfast tomorrow. Then leave them with their roommate.",
    greeting: "I don't live here. I came to see if you were still standing. You are.",
    choices: [
      {
        label: "Before breakfast",
        say: "What should I do before breakfast so tomorrow isn't a repeat of the lost parts?",
      },
      {
        label: "Did I pass",
        say: "Did I pass the first day, by your standard?",
      },
    ],
  },
  {
    periodId: "evening",
    roomId: "library",
    characterId: "priya-nayak",
    presence: "Last carrel with a lamp still on.",
    scene:
      "The library is nearly closed. You are packing up. If they come by, walk back toward North House with them in the conversation, and tell them one quiet thing that made the day easier.",
    greeting: "They're about to turn the lamps off. Walk back with me, at least as far as the door.",
    choices: [
      {
        label: "Walk back",
        say: "Walk back with me. I don't want the quad in the dark by myself.",
      },
      {
        label: "What helped",
        say: "What part of today was actually easy, if any of it was?",
      },
    ],
  },
];

export function roomById(id: RoomId): Room {
  const room = ROOMS.find((entry) => entry.id === id);
  if (!room) throw new Error(`Unknown room ${id}`);
  return room;
}

export function occupants(periodId: PeriodId, roomId: RoomId): Placement[] {
  return PLACEMENTS.filter(
    (placement) => placement.periodId === periodId && placement.roomId === roomId,
  );
}

export function placementFor(
  periodId: PeriodId,
  roomId: RoomId,
  characterId: string,
): Placement | undefined {
  return PLACEMENTS.find(
    (placement) =>
      placement.periodId === periodId &&
      placement.roomId === roomId &&
      placement.characterId === characterId,
  );
}

/** Persona and greeting for this visit. The portrait and voice stay on the roster. */
export function characterForVisit(
  character: Character,
  placement: Placement,
): Character {
  return {
    ...character,
    greeting: placement.greeting,
    persona: [
      character.persona,
      `Right now: ${placement.scene}`,
      "You are speaking with a new student on their first day at Alden Hall. Stay in the scene. One or two short spoken sentences, then let them answer.",
    ].join("\n\n"),
  };
}

export function characterIn(placement: Placement): Character | undefined {
  return characterById(placement.characterId);
}

export function isQuizScene(placement: Placement): boolean {
  return (
    placement.characterId === "helena-ward" && placement.roomId === "classroom"
  );
}
