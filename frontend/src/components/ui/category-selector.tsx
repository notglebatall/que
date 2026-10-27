import { HeroCarousel, type HeroCarouselItem } from "@/components/ui/hero-carousel"

export interface CategoryItem extends HeroCarouselItem {
  id: string
}

interface CategorySelectorProps {
  items: CategoryItem[]
  index: number
  onIndexChange: (index: number) => void
  className?: string
}

export function CategorySelector(props: CategorySelectorProps) {
  return <HeroCarousel {...props} brand="Рубрики новостей" ariaLabel="Рубрики новостей" ariaControls="news-feed" />
}
