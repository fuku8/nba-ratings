import { Metadata } from "next";
import { getTeamRatings, getPlayerRatings } from "@/lib/nba-api";
import { PlayerRatingsTable } from "@/components/player-ratings-table";
import { StatCard } from "@/components/stat-card";
import { NBA_TEAMS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 3600;

type Props = {
  params: Promise<{ teamId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamId } = await params;
  const teams = await getTeamRatings();
  const team = teams.find((t) => t.teamId.toString() === teamId);
  return {
    title: team ? team.teamName : "Team Details",
  };
}

export default async function TeamPage({ params }: Props) {
  const { teamId } = await params;
  const [teams, allPlayers] = await Promise.all([
    getTeamRatings(),
    getPlayerRatings(Number(teamId)),
  ]);

  const team = teams.find((t) => t.teamId.toString() === teamId);
  const players = allPlayers.filter((p) => p.gp >= 5);
  const teamInfo = team ? NBA_TEAMS[team.teamAbbreviation] : null;

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Team not found</p>
        <Link href="/" className="mt-4 text-sm text-primary hover:underline">
          Back to teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All Teams
      </Link>

      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
          style={{ backgroundColor: teamInfo?.darkColor || "#888" }}
        >
          {team.teamAbbreviation}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{team.teamName}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {team.wins}-{team.losses}
            </span>
            <Badge variant="outline" className="text-xs">
              {team.pace.toFixed(1)} Pace
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Offensive Rating"
          value={team.offRating.toFixed(1)}
          description="Points per 100 possessions"
        />
        <StatCard
          label="Defensive Rating"
          value={team.defRating.toFixed(1)}
          description="Points allowed per 100 possessions"
        />
        <StatCard
          label="Net Rating"
          value={`${team.netRating > 0 ? "+" : ""}${team.netRating.toFixed(1)}`}
          description="ORtg - DRtg"
          trend={team.netRating > 0 ? "positive" : team.netRating < 0 ? "negative" : "neutral"}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Roster</h2>
        <PlayerRatingsTable players={players} showTeam={false} />
      </div>
    </div>
  );
}
