import catalog from "./qaq-catalog.json";

export type SlotId =
  | "head"
  | "face"
  | "body"
  | "legs"
  | "feet"
  | "weapon"
  | "relic";

export interface GearItem {
  id: string;
  s: SlotId;
  t: string;
  e: string;
  n: string;
  fx: string;
  req?: string;
  [extra: string]: unknown;
}

export interface SenseiLine {
  c: string;
  s: string;
  t: string;
}

export interface Tier {
  n: string;
}

export const SLOTS = catalog.slots as Array<{ id: SlotId; e: string; n: string }>;
export const ITEMS = catalog.items as GearItem[];
export const ITEM: Record<string, GearItem> = Object.fromEntries(
  ITEMS.map((it) => [it.id, it]),
);
export const TIERS = catalog.tiers as Record<string, Tier>;
export const SENSEI_LINES = catalog.senseiLines as SenseiLine[];
export const SERIES = catalog.series as Record<string, { n: string; e: string }>;
export const HAIRS = catalog.hairs as Array<[string, string]>;

/** 3D props from Nihongo Quest that work as icons (buildProp names). */
export const PROPS = [
  "パソコン", "スマホ", "カメラ", "ゲーム", "ノート", "ペン", "ほん", "てがみ",
  "とけい", "めがね", "プレゼント", "チケット", "おかね", "かばん", "さいふ",
  "コーヒー", "おちゃ", "すし", "ケーキ", "ピザ", "ハンバーガー", "アイスクリーム",
  "おべんとう", "ごはん", "りんご", "ねこ", "いぬ", "はな", "テニス", "サッカー",
  "やきゅう", "スキー", "ギター", "ピアノ", "おんがく", "えいが", "テレビ",
  "じんじゃ", "おてら", "やま", "いえ", "がっこう", "でんしゃ", "しんかんせん",
  "ひこうき", "くるま", "じてんしゃ", "かさ", "ゆき", "はれ", "でんき", "くすり",
  "おもちゃ", "おみやげ", "たんじょうび", "carcassonne", "boardgames", "monopoly-man", "japan-flag", "gamepad", "mario", "luigi", "cow", "ufo", "tiger", "duck", "baby",
];

export interface Skill {
  id: string;
  name: string;
  pct: number;
  icon: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
  /** an uploaded copy of the certificate (PDF or image) in /public/certificates */
  file?: string;
  icon: string;
}

export interface Interest {
  id: string;
  name: string;
  icon: string;
  /** small extra pictures next to the main one (e.g. Mario and Luigi next to the gamepad) */
  extra?: string[];
}

export interface SenseiImage {
  c: string;
  src: string;
}

export interface Profile {
  name: string;
  level: number;
  rank: string;
  hair: string;
  equip: Partial<Record<SlotId, string>>;
  owned: string[];
  skills: Skill[];
  certificates: Certificate[];
  interests: Interest[];
  sensei: SenseiImage[];
}

/** The spec object the QA3D engine expects: { hair, head: item, face: item, ... }. */
export function avatarSpec(profile: Pick<Profile, "hair" | "equip">) {
  const spec: Record<string, unknown> = { hair: profile.hair };
  for (const slot of SLOTS) {
    const id = profile.equip[slot.id];
    if (id && ITEM[id]) spec[slot.id] = ITEM[id];
  }
  return spec;
}

/** Which quote is up: the same for everyone, switching every `minutes` (local time). */
export function quoteIndex(length: number, now = new Date(), minutes = 30) {
  const slot = Math.floor(
    (now.getTime() - now.getTimezoneOffset() * 60000) / (minutes * 60000),
  );
  return ((slot % length) + length) % length;
}
