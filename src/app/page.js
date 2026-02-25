import HeroSection from "@/components/home/HeroSection";
import FeatureSection from "@/components/home/FeatureSection";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";

export default async function HomePage() {
  const clerkUser = await currentUser();
  if (clerkUser) {
    await syncUser(clerkUser);
  }

  return (
    <main>
      <HeroSection />
      <FeatureSection />
    </main>
  );
}
