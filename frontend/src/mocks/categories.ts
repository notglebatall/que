import type { CategoryItem } from "@/components/ui/category-selector"

// Демонстрационные изображения рубрик. Это не новостные фотографии.
export const categories: CategoryItem[] = [
  {
    id: "all",
    title: "Все новости",
    image: "/images/overview.jpg",
    credit: "Главное — в одной ленте",
    accent: "#dbe1d7",
  },
  {
    id: "economy",
    title: "Экономика",
    image: "/images/economy.jpg",
    credit: "Рынки, показатели и тенденции",
    accent: "#dce5d5",
  },
  {
    id: "politics",
    title: "Политика",
    image: "/images/politics.jpg",
    credit: "Решения и международная повестка",
    accent: "#dbe3ec",
  },
  {
    id: "finance",
    title: "Финансы",
    image: "/images/finance.jpg",
    credit: "Банки, инвестиции и финансовая система",
    accent: "#e8e0ce",
  },
  {
    id: "technology",
    title: "Технологии",
    image: "/images/technology.jpg",
    credit: "Идеи, которые меняют привычное",
    accent: "#dfe1ed",
  },
  {
    id: "other",
    title: "Прочее",
    image: "/images/other.jpg",
    credit: "За пределами основных рубрик",
    accent: "#e9dfd6",
  },
]
