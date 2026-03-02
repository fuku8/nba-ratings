#!/usr/bin/env node

/**
 * Fetch NBA stats CSV from the NBA-Rating-Visualizer GitHub repository.
 * The source repo scrapes Basketball Reference and commits updated CSVs.
 * Run locally or in GitHub Actions: node scripts/fetch-data.mjs
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

const REPO = "fuku8/NBA-Rating-Visualizer";
const BRANCH = "main";
const FILES = ["team_ratings.csv", "player_ratings.csv", "last_updated.txt"];

function getLocalLastUpdated() {
  const path = join(DATA_DIR, "last_updated.txt");
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8").trim();
}

function parseTimestamp(value) {
  if (!value) return null;
  const normalized = value.trim().replace(" ", "T");
  const date = new Date(`${normalized}+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function fetchFromGitHub(filePath) {
  const url = `https://api.github.com/repos/${REPO}/contents/data/${filePath}?ref=${BRANCH}`;
  const headers = { Accept: "application/vnd.github.v3+json" };

  // Use GITHUB_TOKEN if available (for GitHub Actions)
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText} for ${filePath}`);
  }

  const json = await res.json();
  // GitHub API returns base64-encoded content
  return Buffer.from(json.content, "base64").toString("utf-8");
}

async function main() {
  console.log(`\nNBA Data Fetch (from GitHub: ${REPO})\n`);

  mkdirSync(DATA_DIR, { recursive: true });

  try {
    const sourceLastUpdated = (await fetchFromGitHub("last_updated.txt")).trim();
    const localLastUpdated = getLocalLastUpdated();
    const sourceDate = parseTimestamp(sourceLastUpdated);
    const localDate = parseTimestamp(localLastUpdated);

    console.log(`  Source data last updated: ${sourceLastUpdated}`);
    if (localLastUpdated) {
      console.log(`  Local data last updated:  ${localLastUpdated}`);
    } else {
      console.log("  Local data last updated:  none");
    }

    if (sourceDate && localDate && sourceDate <= localDate) {
      console.log("\nSkipping update because source data is not newer.\n");
      return;
    }

    for (const file of FILES) {
      console.log(`  Fetching ${file}...`);
      const content = await fetchFromGitHub(file);
      writeFileSync(join(DATA_DIR, file), content);
      console.log(`  Saved data/${file}`);
    }

    console.log("\nDone!\n");
  } catch (err) {
    console.error(`\nFailed to fetch data: ${err.message}\n`);
    process.exit(1);
  }
}

main();
