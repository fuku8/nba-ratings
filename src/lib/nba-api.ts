import { TeamRating, PlayerRating, NBAApiResponse } from "./types";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const NBA_STATS_BASE = "https://stats.nba.com/stats";
const CURRENT_SEASON = "2025-26";

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.nba.com/",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://www.nba.com",
  Accept: "application/json, text/plain, */*",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
};

// Team ID → abbreviation (stats.nba.com team endpoint doesn't include it)
const TEAM_ID_TO_ABBR: Record<number, string> = {
  1610612737: "ATL", 1610612738: "BOS", 1610612751: "BKN", 1610612766: "CHA",
  1610612741: "CHI", 1610612739: "CLE", 1610612742: "DAL", 1610612743: "DEN",
  1610612765: "DET", 1610612744: "GSW", 1610612745: "HOU", 1610612754: "IND",
  1610612746: "LAC", 1610612747: "LAL", 1610612763: "MEM", 1610612748: "MIA",
  1610612749: "MIL", 1610612750: "MIN", 1610612740: "NOP", 1610612752: "NYK",
  1610612760: "OKC", 1610612753: "ORL", 1610612755: "PHI", 1610612756: "PHX",
  1610612757: "POR", 1610612758: "SAC", 1610612759: "SAS", 1610612761: "TOR",
  1610612762: "UTA", 1610612764: "WAS",
};

// ---------------------------------------------------------------------------
// API fetch
// ---------------------------------------------------------------------------

async function fetchNBAStats(endpoint: string, params: Record<string, string>): Promise<NBAApiResponse> {
  const url = new URL(`${NBA_STATS_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: HEADERS,
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`NBA API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function mapRow(headers: string[], row: (string | number)[]): Record<string, string | number> {
  const obj: Record<string, string | number> = {};
  headers.forEach((h, i) => {
    obj[h] = row[i];
  });
  return obj;
}

// ---------------------------------------------------------------------------
// CSV fallback
// ---------------------------------------------------------------------------

function resolveDataPath(filename: string): string {
  // In Vercel, process.cwd() points to the project root
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

function loadTeamRatingsFromCSV(): TeamRating[] | null {
  const path = resolveDataPath("team_ratings.csv");
  if (!existsSync(path)) return null;
  const rows = parseCSV(readFileSync(path, "utf-8"));
  return rows.map((r) => ({
    teamId: Number(r.TEAM_ID),
    teamName: r.TEAM_NAME,
    teamAbbreviation: r.TEAM_ABBREVIATION || TEAM_ID_TO_ABBR[Number(r.TEAM_ID)] || "",
    wins: Number(r.W) || 0,
    losses: Number(r.L) || 0,
    offRating: Number(r.OFF_RATING) || 0,
    defRating: Number(r.DEF_RATING) || 0,
    netRating: Number(r.NET_RATING) || 0,
    pace: Number(r.PACE) || 0,
  }));
}

function loadPlayerRatingsFromCSV(teamId?: number): PlayerRating[] | null {
  const path = resolveDataPath("player_ratings.csv");
  if (!existsSync(path)) return null;
  let rows = parseCSV(readFileSync(path, "utf-8"));
  if (teamId) {
    rows = rows.filter((r) => Number(r.TEAM_ID) === teamId);
  }
  return rows.map((r) => ({
    playerId: Number(r.PLAYER_ID),
    playerName: r.PLAYER_NAME,
    teamId: Number(r.TEAM_ID),
    teamAbbreviation: r.TEAM_ABBREVIATION || "",
    age: Number(r.AGE) || 0,
    gp: Number(r.GP) || 0,
    min: Number(r.MIN) || 0,
    offRating: Number(r.OFF_RATING) || 0,
    defRating: Number(r.DEF_RATING) || 0,
    netRating: Number(r.NET_RATING) || 0,
    pie: Number(r.PIE) || 0,
  }));
}

export function getLastUpdated(): string | null {
  const path = resolveDataPath("last_updated.txt");
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8").trim();
}

// ---------------------------------------------------------------------------
// Public API (with fallback)
// ---------------------------------------------------------------------------

export async function getTeamRatings(): Promise<TeamRating[]> {
  try {
    const data = await fetchNBAStats("leaguedashteamstats", {
      Conference: "", DateFrom: "", DateTo: "", Division: "",
      GameScope: "", GameSegment: "", Height: "", ISTRound: "",
      LastNGames: "0", LeagueID: "00", Location: "",
      MeasureType: "Advanced", Month: "0", OpponentTeamID: "0",
      Outcome: "", PORound: "0", PaceAdjust: "N", PerMode: "PerGame",
      Period: "0", PlayerExperience: "", PlayerPosition: "",
      PlusMinus: "N", Rank: "N", Season: CURRENT_SEASON,
      SeasonSegment: "", SeasonType: "Regular Season",
      ShotClockRange: "", StarterBench: "", TeamID: "0",
      TwoWay: "0", VsConference: "", VsDivision: "",
    });

    const rs = data.resultSets[0];
    return rs.rowSet.map((row) => {
      const r = mapRow(rs.headers, row);
      return {
        teamId: r["TEAM_ID"] as number,
        teamName: r["TEAM_NAME"] as string,
        teamAbbreviation: TEAM_ID_TO_ABBR[r["TEAM_ID"] as number] || "",
        wins: (r["W"] as number) || 0,
        losses: (r["L"] as number) || 0,
        offRating: Number((r["OFF_RATING"] as number)?.toFixed(1)) || 0,
        defRating: Number((r["DEF_RATING"] as number)?.toFixed(1)) || 0,
        netRating: Number((r["NET_RATING"] as number)?.toFixed(1)) || 0,
        pace: Number((r["PACE"] as number)?.toFixed(1)) || 0,
      };
    });
  } catch (err) {
    console.warn("[NBA API] Team ratings fetch failed, using CSV fallback:", (err as Error).message);
    const fallback = loadTeamRatingsFromCSV();
    if (fallback) return fallback;
    throw err;
  }
}

export async function getPlayerRatings(teamId?: number): Promise<PlayerRating[]> {
  try {
    const data = await fetchNBAStats("leaguedashplayerstats", {
      College: "", Conference: "", Country: "", DateFrom: "", DateTo: "",
      Division: "", DraftPick: "", DraftYear: "", GameScope: "",
      GameSegment: "", Height: "", ISTRound: "", LastNGames: "0",
      LeagueID: "00", Location: "", MeasureType: "Advanced", Month: "0",
      OpponentTeamID: "0", Outcome: "", PORound: "0", PaceAdjust: "N",
      PerMode: "PerGame", Period: "0", PlayerExperience: "",
      PlayerPosition: "", PlusMinus: "N", Rank: "N", Season: CURRENT_SEASON,
      SeasonSegment: "", SeasonType: "Regular Season", ShotClockRange: "",
      StarterBench: "", TeamID: teamId?.toString() || "0", TwoWay: "0",
      VsConference: "", VsDivision: "", Weight: "",
    });

    const rs = data.resultSets[0];
    return rs.rowSet.map((row) => {
      const r = mapRow(rs.headers, row);
      return {
        playerId: r["PLAYER_ID"] as number,
        playerName: r["PLAYER_NAME"] as string,
        teamId: r["TEAM_ID"] as number,
        teamAbbreviation: (r["TEAM_ABBREVIATION"] as string) || "",
        age: (r["AGE"] as number) || 0,
        gp: (r["GP"] as number) || 0,
        min: Number((r["MIN"] as number)?.toFixed(1)) || 0,
        offRating: Number((r["OFF_RATING"] as number)?.toFixed(1)) || 0,
        defRating: Number((r["DEF_RATING"] as number)?.toFixed(1)) || 0,
        netRating: Number((r["NET_RATING"] as number)?.toFixed(1)) || 0,
        pie: Number(((r["PIE"] as number) * 100)?.toFixed(1)) || 0,
      };
    });
  } catch (err) {
    console.warn("[NBA API] Player ratings fetch failed, using CSV fallback:", (err as Error).message);
    const fallback = loadPlayerRatingsFromCSV(teamId);
    if (fallback) return fallback;
    throw err;
  }
}

export async function searchPlayers(query: string): Promise<PlayerRating[]> {
  const allPlayers = await getPlayerRatings();
  const q = query.toLowerCase();
  return allPlayers.filter((p) => p.playerName.toLowerCase().includes(q));
}
