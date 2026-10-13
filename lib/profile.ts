import fs from "fs";
import path from "path";
import type { Profile } from "./catalog";

const profilePath = path.join(process.cwd(), "content", "profile.json");

export function getProfile(): Profile {
  return JSON.parse(fs.readFileSync(profilePath, "utf8")) as Profile;
}

export function saveProfile(profile: Profile) {
  fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2) + "\n", "utf8");
}
