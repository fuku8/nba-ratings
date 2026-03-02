import { getTeamRatings } from "@/lib/nba-api";
import { TeamRatingsTable } from "@/components/team-ratings-table";
import { RatingScatterChart } from "@/components/rating-scatter-chart";
import { RatingBarChart } from "@/components/rating-bar-chart";
import { StatCard } from "@/components/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const revalidate = 3600;

export default async function HomePage() {
  const teams = await getTeamRatings();

  if (teams.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Team Ratings</h1>
        <p className="text-sm text-muted-foreground">
          No team data is available right now.
        </p>
      </div>
    );
  }

  const bestOff = [...teams].sort((a, b) => b.offRating - a.offRating)[0];
  const bestDef = [...teams].sort((a, b) => a.defRating - b.defRating)[0];
  const bestNet = [...teams].sort((a, b) => b.netRating - a.netRating)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Ratings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Offensive, defensive, and net ratings for all 30 NBA teams
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Best Offense"
          value={`${bestOff.offRating.toFixed(1)}`}
          description={bestOff.teamName}
          trend="positive"
        />
        <StatCard
          label="Best Defense"
          value={`${bestDef.defRating.toFixed(1)}`}
          description={bestDef.teamName}
          trend="positive"
        />
        <StatCard
          label="Best Net Rating"
          value={`${bestNet.netRating > 0 ? "+" : ""}${bestNet.netRating.toFixed(1)}`}
          description={bestNet.teamName}
          trend="positive"
        />
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
          <TabsTrigger value="bar">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <TeamRatingsTable teams={teams} />
        </TabsContent>

        <TabsContent value="scatter">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2">
              <h3 className="text-sm font-semibold">ORtg vs DRtg</h3>
              <p className="text-xs text-muted-foreground">
                Top-right = best teams (high offense, low defense allowed)
              </p>
            </div>
            <RatingScatterChart teams={teams} />
          </div>
        </TabsContent>

        <TabsContent value="bar">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2">
              <h3 className="text-sm font-semibold">Net Rating Rankings</h3>
              <p className="text-xs text-muted-foreground">
                Points scored minus points allowed per 100 possessions
              </p>
            </div>
            <RatingBarChart teams={teams} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
