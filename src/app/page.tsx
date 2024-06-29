"use client";

import Hero from "./components/Hero";

const img = "/hero.jpg";

export default function Home() {
  return (
    <Hero
      imageUrl={img}
      imageAlt="Content delivery platform"
      heading="Don't just code. Build"
      buttonText="Try PracticeCraft.AI for free"
    />
  );
}
