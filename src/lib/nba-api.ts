import { TeamRating, PlayerRating, NBAApiResponse } from "./types";

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

async function fetchNBAStats(endpoint: string, params: Record<string, string>): Promise<NBAApiResponse> {
  const url = new URL(`${NBA_STATS_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: HEADERS,
    next: { revalidate: 3600 },
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

export async function getTeamRatings(): Promise<TeamRating[]> {
  const data = await fetchNBAStats("leaguedashteamstats", {
    Conference: "",
    DateFrom: "",
    DateTo: "",
    Division: "",
    GameScope: "",
    GameSegment: "",
    Height: "",
    ISTRound: "",
    LastNGames: "0",
    LeagueID: "00",
    Location: "",
    MeasureType: "Advanced",
    Month: "0",
    OpponentTeamID: "0",
    Outcome: "",
    PORound: "0",
    PaceAdjust: "N",
    PerMode: "PerGame",
    Period: "0",
    PlayerExperience: "",
    PlayerPosition: "",
    PlusMinus: "N",
    Rank: "N",
    Season: CURRENT_SEASON,
    SeasonSegment: "",
    SeasonType: "Regular Season",
    ShotClockRange: "",
    StarterBench: "",
    TeamID: "0",
    TwoWay: "0",
    VsConference: "",
    VsDivision: "",
  });

  const rs = data.resultSets[0];
  return rs.rowSet.map((row) => {
    const r = mapRow(rs.headers, row);
    return {
      teamId: r["TEAM_ID"] as number,
      teamName: r["TEAM_NAME"] as string,
      teamAbbreviation: (r["TEAM_ABBREVIATION"] as string) || "",
      wins: (r["W"] as number) || 0,
      losses: (r["L"] as number) || 0,
      offRating: Number((r["OFF_RATING"] as number)?.toFixed(1)) || 0,
      defRating: Number((r["DEF_RATING"] as number)?.toFixed(1)) || 0,
      netRating: Number((r["NET_RATING"] as number)?.toFixed(1)) || 0,
      pace: Number((r["PACE"] as number)?.toFixed(1)) || 0,
    };
  });
}

export async function getPlayerRatings(teamId?: number): Promise<PlayerRating[]> {
  const params: Record<string, string> = {
    College: "",
    Conference: "",
    Country: "",
    DateFrom: "",
    DateTo: "",
    Division: "",
    DraftPick: "",
    DraftYear: "",
    GameScope: "",
    GameSegment: "",
    Height: "",
    ISTRound: "",
    LastNGames: "0",
    LeagueID: "00",
    Location: "",
    MeasureType: "Advanced",
    Month: "0",
    OpponentTeamID: "0",
    Outcome: "",
    PORound: "0",
    PaceAdjust: "N",
    PerMode: "PerGame",
    Period: "0",
    PlayerExperience: "",
    PlayerPosition: "",
    PlusMinus: "N",
    Rank: "N",
    Season: CURRENT_SEASON,
    SeasonSegment: "",
    SeasonType: "Regular Season",
    ShotClockRange: "",
    StarterBench: "",
    TeamID: teamId?.toString() || "0",
    TwoWay: "0",
    VsConference: "",
    VsDivision: "",
    Weight: "",
  };

  const data = await fetchNBAStats("leaguedashplayerstats", params);
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
}

export async function searchPlayers(query: string): Promise<PlayerRating[]> {
  const allPlayers = await getPlayerRatings();
  const q = query.toLowerCase();
  return allPlayers.filter((p) => p.playerName.toLowerCase().includes(q));
}
