import { Metadata } from "next";
import { getPlayerRatings } from "@/lib/nba-api";
import { SearchPageClient } from "./client";

export const metadata: Metadata = {
  title: "Player Search",
  description: "Search NBA players by name and view their net rating stats",
};

export const revalidate = 3600;

export default async function SearchPage() {
  const players = await getPlayerRatings();
  return <SearchPageClient players={players} />;
}
