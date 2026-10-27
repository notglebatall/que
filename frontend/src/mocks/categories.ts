import type { HeroCarouselItem } from "@/components/ui/hero-carousel"

// Демонстрационные изображения рубрик. Это не новостные фотографии.
export const categories: HeroCarouselItem[] = [
  {
    id: "all",
    title: "Все новости",
    image: "/images/overview.jpg",
    credit: "Главное — в одной ленте",
    meta: ["Пять рубрик", "Единая повестка"],
    accent: "#dbe1d7",
  },
  {
    id: "economy",
    title: "Экономика",
    image: "/images/economy.jpg",
    credit: "Рынки, показатели и тенденции",
    meta: ["Деньги", "Котировки"],
    accent: "#dce5d5",
  },
  {
    id: "politics",
    title: "Политика",
    image: "/images/politics.jpg",
    credit: "Решения и международная повестка",
    meta: ["Страны", "События"],
    accent: "#dbe3ec",
  },
  {
    id: "finance",
    title: "Финансы",
    image: "/images/finance.jpg",
    credit: "Банки, инвестиции и финансовая система",
    meta: ["Капитал", "Инвестиции"],
    accent: "#e8e0ce",
  },
  {
    id: "technology",
    title: "Технологии",
    image: "/images/technology.jpg",
    credit: "Идеи, которые меняют привычное",
    meta: ["Инновации", "Цифровая среда"],
    accent: "#dfe1ed",
  },
  {
    id: "other",
    title: "Прочее",
    image: "/images/other.jpg",
    credit: "За пределами основных рубрик",
    meta: ["Общество", "Кругозор"],
    accent: "#e9dfd6",
  },
]
