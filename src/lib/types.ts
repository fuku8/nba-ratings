export interface TeamRating {
  teamName: string;
  teamAbbreviation: string;
  offRating: number;
  defRating: number;
  netRating: number;
}

export interface PlayerRating {
  playerName: string;
  teamAbbreviation: string;
  gp: number;
  ows: number;
  dws: number;
  ws: number;
}

export const NBA_TEAMS: Record<string, { name: string; color: string; darkColor: string }> = {
  ATL: { name: "Atlanta Hawks", color: "#E03A3E", darkColor: "#C9363A" },
  BOS: { name: "Boston Celtics", color: "#007A33", darkColor: "#008C3A" },
  BKN: { name: "Brooklyn Nets", color: "#000000", darkColor: "#555555" },
  CHA: { name: "Charlotte Hornets", color: "#1D1160", darkColor: "#6F5B9A" },
  CHI: { name: "Chicago Bulls", color: "#CE1141", darkColor: "#D42E56" },
  CLE: { name: "Cleveland Cavaliers", color: "#860038", darkColor: "#B3004B" },
  DAL: { name: "Dallas Mavericks", color: "#00538C", darkColor: "#0073BF" },
  DEN: { name: "Denver Nuggets", color: "#0E2240", darkColor: "#1A3A6B" },
  DET: { name: "Detroit Pistons", color: "#C8102E", darkColor: "#D43A56" },
  GSW: { name: "Golden State Warriors", color: "#1D428A", darkColor: "#2D5ABF" },
  HOU: { name: "Houston Rockets", color: "#CE1141", darkColor: "#D42E56" },
  IND: { name: "Indiana Pacers", color: "#002D62", darkColor: "#004A99" },
  LAC: { name: "LA Clippers", color: "#C8102E", darkColor: "#D43A56" },
  LAL: { name: "Los Angeles Lakers", color: "#552583", darkColor: "#7B3DB8" },
  MEM: { name: "Memphis Grizzlies", color: "#5D76A9", darkColor: "#7B93C4" },
  MIA: { name: "Miami Heat", color: "#98002E", darkColor: "#CC003D" },
  MIL: { name: "Milwaukee Bucks", color: "#00471B", darkColor: "#006B29" },
  MIN: { name: "Minnesota Timberwolves", color: "#0C2340", darkColor: "#1A3D6B" },
  NOP: { name: "New Orleans Pelicans", color: "#0C2340", darkColor: "#1A3D6B" },
  NYK: { name: "New York Knicks", color: "#006BB6", darkColor: "#0088E6" },
  OKC: { name: "Oklahoma City Thunder", color: "#007AC1", darkColor: "#009AE6" },
  ORL: { name: "Orlando Magic", color: "#0077C0", darkColor: "#0099F0" },
  PHI: { name: "Philadelphia 76ers", color: "#006BB6", darkColor: "#0088E6" },
  PHX: { name: "Phoenix Suns", color: "#1D1160", darkColor: "#6F5B9A" },
  POR: { name: "Portland Trail Blazers", color: "#E03A3E", darkColor: "#C9363A" },
  SAC: { name: "Sacramento Kings", color: "#5A2D81", darkColor: "#7B3DB8" },
  SAS: { name: "San Antonio Spurs", color: "#C4CED4", darkColor: "#8A9AA0" },
  TOR: { name: "Toronto Raptors", color: "#CE1141", darkColor: "#D42E56" },
  UTA: { name: "Utah Jazz", color: "#002B5C", darkColor: "#004A99" },
  WAS: { name: "Washington Wizards", color: "#002B5C", darkColor: "#004A99" },
};

// Team name → abbreviation mapping
export const TEAM_NAME_TO_ABBR: Record<string, string> = {
  "Atlanta Hawks": "ATL",
  "Boston Celtics": "BOS",
  "Brooklyn Nets": "BKN",
  "Charlotte Hornets": "CHA",
  "Chicago Bulls": "CHI",
  "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL",
  "Denver Nuggets": "DEN",
  "Detroit Pistons": "DET",
  "Golden State Warriors": "GSW",
  "Houston Rockets": "HOU",
  "Indiana Pacers": "IND",
  "LA Clippers": "LAC",
  "Los Angeles Clippers": "LAC",
  "Los Angeles Lakers": "LAL",
  "Memphis Grizzlies": "MEM",
  "Miami Heat": "MIA",
  "Milwaukee Bucks": "MIL",
  "Minnesota Timberwolves": "MIN",
  "New Orleans Pelicans": "NOP",
  "New York Knicks": "NYK",
  "Oklahoma City Thunder": "OKC",
  "Orlando Magic": "ORL",
  "Philadelphia 76ers": "PHI",
  "Phoenix Suns": "PHX",
  "Portland Trail Blazers": "POR",
  "Sacramento Kings": "SAC",
  "San Antonio Spurs": "SAS",
  "Toronto Raptors": "TOR",
  "Utah Jazz": "UTA",
  "Washington Wizards": "WAS",
};
