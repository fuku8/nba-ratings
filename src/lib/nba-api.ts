import { TeamRating, PlayerRating, TEAM_NAME_TO_ABBR } from "./types";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Basketball Reference abbreviation → standard NBA abbreviation
const BR_ABBR_MAP: Record<string, string> = {
  BRK: "BKN",
  CHO: "CHA",
  PHO: "PHX",
};

// ---------------------------------------------------------------------------
// CSV data loading
// ---------------------------------------------------------------------------

function resolveDataPath(filename: string): string {
  return join(process.cwd(), "data", filename);
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
}

export function getLastUpdated(): string | null {
  const path = resolveDataPath("last_updated.txt");
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8").trim();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getTeamRatings(): Promise<TeamRating[]> {
  const path = resolveDataPath("team_ratings.csv");
  if (!existsSync(path)) return [];
  const rows = parseCSV(readFileSync(path, "utf-8"));
  return rows
    .filter((r) => r.TEAM_NAME && r.TEAM_NAME !== "League Average")
    .map((r) => ({
      teamName: r.TEAM_NAME,
      teamAbbreviation: TEAM_NAME_TO_ABBR[r.TEAM_NAME] || "",
      offRating: Number(r.OFF_RATING) || 0,
      defRating: Number(r.DEF_RATING) || 0,
      netRating: Number(r.NET_RATING) || 0,
    }));
}

export async function getPlayerRatings(teamAbbreviation?: string): Promise<PlayerRating[]> {
  const path = resolveDataPath("player_ratings.csv");
  if (!existsSync(path)) return [];
  const rows = parseCSV(readFileSync(path, "utf-8"));
  return rows
    .filter((r) => {
      if (!r.PLAYER_NAME || r.PLAYER_NAME === "Player") return false;
      // Skip multi-team aggregate rows (2TM, 3TM, etc.)
      const rawTeam = (r.TEAM_ID || "").trim();
      if (/^\d+TM$/.test(rawTeam)) return false;
      if (teamAbbreviation) {
        const normalized = BR_ABBR_MAP[rawTeam] || rawTeam;
        return normalized === teamAbbreviation;
      }
      return true;
    })
    .map((r) => {
      const rawTeam = (r.TEAM_ID || "").trim();
      return {
        playerName: r.PLAYER_NAME,
        teamAbbreviation: BR_ABBR_MAP[rawTeam] || rawTeam,
        gp: Number(r.GP) || 0,
        ows: Number(r.OFF_RATING) || 0,
        dws: Number(r.DEF_RATING) || 0,
        ws: Number(r.NET_RATING) || 0,
      };
    });
}

export async function searchPlayers(query: string): Promise<PlayerRating[]> {
  const allPlayers = await getPlayerRatings();
  const q = query.toLowerCase();
  return allPlayers.filter((p) => p.playerName.toLowerCase().includes(q));
}
