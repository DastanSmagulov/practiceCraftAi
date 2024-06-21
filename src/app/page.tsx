"use client";

import Hero from "./components/Hero";

const img = "/hero.jpg";

import Image from "next/image";

export default function Home() {
  return (
    <Hero
      imageUrl={img}
      imageAlt="Content delivery platform"
      heading="Don't just code. Build"
      subheading="Gain the necessary development experience for successful employment
with pet projects from PracticeCraft AI"
      buttonText="Try FREE for 14 days"
    />
  );
}
