"use client"

import { HeroCarousel } from "@/components/ui/hero-carousel"
import { categories } from "@/mocks/categories"

// Standalone preview using the project's local demonstration illustrations.
export default function HeroCarouselDemo() {
  return <HeroCarousel items={categories} defaultIndex={3} />
}
