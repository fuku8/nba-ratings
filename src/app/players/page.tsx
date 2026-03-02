import { Metadata } from "next";
import { getPlayerRatings } from "@/lib/nba-api";
import { PlayersPageClient } from "./client";

export const metadata: Metadata = {
  title: "All Players",
  description: "Net rating for all NBA players in the 2025-26 season",
};

export const revalidate = 3600;

export default async function PlayersPage() {
  const players = await getPlayerRatings();
  return <PlayersPageClient players={players} />;
}
