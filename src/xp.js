import fs from "fs";
import path from "path";

const xpFile = path.join("./data/userXP.json");
export let userXP = {};
export let userLevel = {};

// Load XP
try { userXP = JSON.parse(fs.readFileSync(xpFile)); } catch {}
try { userLevel = JSON.parse(fs.readFileSync("./data/levelRoles.json")); } catch {}

export function addXP(userId, amount) {
  if (!userXP[userId]) userXP[userId] = 0;
  userXP[userId] += amount;

  const newLevel = Math.floor(userXP[userId] / 100);
  const oldLevel = userLevel[userId] || 0;

  if (newLevel > oldLevel) {
    userLevel[userId] = newLevel;
    saveXP();
    return newLevel;
  }

  saveXP();
  return null;
}

function saveXP() {
  fs.writeFileSync(xpFile, JSON.stringify(userXP, null, 2));
  fs.writeFileSync("./data/levelRoles.json", JSON.stringify(userLevel, null, 2));
}
