#!/usr/bin/env node

/**
 * Fetch NBA stats from stats.nba.com and save as CSV files.
 * Run locally or in GitHub Actions: node scripts/fetch-data.mjs
 */

const NBA_STATS_BASE = "https://stats.nba.com/stats";
const CURRENT_SEASON = "2025-26";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.nba.com/",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://www.nba.com",
  Accept: "application/json, text/plain, */*",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
};

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`  Attempt ${i + 1}/${retries} failed: ${err.message}`);
      if (i < retries - 1) {
        console.log(`  Retrying in 5 seconds...`);
        await new Promise((r) => setTimeout(r, 5000));
      } else {
        throw err;
      }
    }
  }
}

function buildURL(endpoint, params) {
  const url = new URL(`${NBA_STATS_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

function mapRow(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = row[i];
  });
  return obj;
}

// Team ID → abbreviation mapping (stats.nba.com team endpoint doesn't include abbreviation)
const TEAM_ID_TO_ABBR = {
  1610612737: "ATL", 1610612738: "BOS", 1610612751: "BKN", 1610612766: "CHA",
  1610612741: "CHI", 1610612739: "CLE", 1610612742: "DAL", 1610612743: "DEN",
  1610612765: "DET", 1610612744: "GSW", 1610612745: "HOU", 1610612754: "IND",
  1610612746: "LAC", 1610612747: "LAL", 1610612763: "MEM", 1610612748: "MIA",
  1610612749: "MIL", 1610612750: "MIN", 1610612740: "NOP", 1610612752: "NYK",
  1610612760: "OKC", 1610612753: "ORL", 1610612755: "PHI", 1610612756: "PHX",
  1610612757: "POR", 1610612758: "SAC", 1610612759: "SAS", 1610612761: "TOR",
  1610612762: "UTA", 1610612764: "WAS",
};

function escapeCSV(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function fetchTeamRatings() {
  console.log("Fetching team ratings...");
  const url = buildURL("leaguedashteamstats", {
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

  const data = await fetchWithRetry(url);
  const rs = data.resultSets[0];
  const teams = rs.rowSet.map((row) => {
    const r = mapRow(rs.headers, row);
    return {
      TEAM_ID: r.TEAM_ID,
      TEAM_NAME: r.TEAM_NAME,
      TEAM_ABBREVIATION: TEAM_ID_TO_ABBR[r.TEAM_ID] || "",
      W: r.W,
      L: r.L,
      OFF_RATING: Number(Number(r.OFF_RATING).toFixed(1)),
      DEF_RATING: Number(Number(r.DEF_RATING).toFixed(1)),
      NET_RATING: Number(Number(r.NET_RATING).toFixed(1)),
      PACE: Number(Number(r.PACE).toFixed(1)),
    };
  });

  console.log(`  Found ${teams.length} teams`);
  return teams;
}

async function fetchPlayerRatings() {
  console.log("Fetching player ratings...");
  const url = buildURL("leaguedashplayerstats", {
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
    TeamID: "0",
    TwoWay: "0",
    VsConference: "",
    VsDivision: "",
    Weight: "",
  });

  const data = await fetchWithRetry(url);
  const rs = data.resultSets[0];
  const players = rs.rowSet.map((row) => {
    const r = mapRow(rs.headers, row);
    return {
      PLAYER_ID: r.PLAYER_ID,
      PLAYER_NAME: r.PLAYER_NAME,
      TEAM_ID: r.TEAM_ID,
      TEAM_ABBREVIATION: r.TEAM_ABBREVIATION,
      AGE: r.AGE,
      GP: r.GP,
      MIN: Number(Number(r.MIN).toFixed(1)),
      OFF_RATING: Number(Number(r.OFF_RATING).toFixed(1)),
      DEF_RATING: Number(Number(r.DEF_RATING).toFixed(1)),
      NET_RATING: Number(Number(r.NET_RATING).toFixed(1)),
      PIE: Number((Number(r.PIE) * 100).toFixed(1)),
    };
  });

  console.log(`  Found ${players.length} players`);
  return players;
}

function toCSV(rows) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCSV(row[h])).join(","));
  }
  return lines.join("\n") + "\n";
}

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

async function main() {
  console.log(`\nNBA Data Fetch - ${CURRENT_SEASON} Season\n`);

  try {
    const teams = await fetchTeamRatings();
    writeFileSync(join(DATA_DIR, "team_ratings.csv"), toCSV(teams));
    console.log("  Saved data/team_ratings.csv");

    // Wait 3 seconds between requests to avoid rate limiting
    console.log("\n  Waiting 3 seconds...\n");
    await new Promise((r) => setTimeout(r, 3000));

    const players = await fetchPlayerRatings();
    writeFileSync(join(DATA_DIR, "player_ratings.csv"), toCSV(players));
    console.log("  Saved data/player_ratings.csv");

    // Save timestamp (JST)
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const timestamp = jst.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
    writeFileSync(join(DATA_DIR, "last_updated.txt"), timestamp);
    console.log(`  Saved data/last_updated.txt (${timestamp} JST)`);

    console.log("\nDone!\n");
  } catch (err) {
    console.error(`\nFailed to fetch data: ${err.message}\n`);
    process.exit(1);
  }
}

main();
