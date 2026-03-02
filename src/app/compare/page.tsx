import { Metadata } from "next";
import { getPlayerRatings } from "@/lib/nba-api";
import { ComparePageClient } from "./client";

export const metadata: Metadata = {
  title: "Compare Players",
  description: "Compare NBA player net ratings side by side",
};

export const revalidate = 3600;

export default async function ComparePage() {
  const players = await getPlayerRatings();
  return <ComparePageClient players={players} />;
}
