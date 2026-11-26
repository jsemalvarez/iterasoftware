import { currentLanding } from "@/landings";

export default function Home() {
  const Landing = currentLanding.Component;
  return <Landing />;
}
