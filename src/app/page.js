import HeroSection from "@/components/home/HeroSection";
import FeatureSection from "@/components/home/FeatureSection";
import HomeLeaderboard from "@/components/home/HomeLeaderboard";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";

export const revalidate = 60;

export default async function HomePage() {
  const clerkUser = await currentUser();
  if (clerkUser) {
    await syncUser(clerkUser);
  }

  return (
    <main>
      <HeroSection />
      <HomeLeaderboard />
      <FeatureSection />
    </main>
  );
}
