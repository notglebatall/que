import { useRef, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

export interface CategoryItem {
  id: string
  title: string
  image: string
  credit?: string
  accent?: string
}

interface CategorySelectorProps {
  items: CategoryItem[]
  index: number
  onIndexChange: (index: number) => void
  className?: string
}

export function CategorySelector({ items, index, onIndexChange, className }: CategorySelectorProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, itemIndex: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return

    const destinations: Record<string, number> = {
      ArrowLeft: itemIndex - 1,
      ArrowRight: itemIndex + 1,
      Home: 0,
      End: items.length - 1,
    }
    if (!(event.key in destinations)) return

    event.preventDefault()
    const next = Math.min(items.length - 1, Math.max(0, destinations[event.key]))
    buttons.current[next]?.focus()
    onIndexChange(next)
  }

  if (!items.length) return null

  return (
    <div role="group" aria-label="Рубрики новостей" className={cn("category-grid", className)}>
      {items.map((item, itemIndex) => (
        <button
          key={item.id}
          ref={(element) => { buttons.current[itemIndex] = element }}
          type="button"
          aria-pressed={itemIndex === index}
          aria-controls="news-feed"
          className="category-card"
          onClick={() => onIndexChange(itemIndex)}
          onKeyDown={(event) => handleKeyDown(event, itemIndex)}
        >
          <img className="category-card-image" src={item.image} alt="" draggable={false} />
          <span className="category-card-label">
            <span>{item.title}</span>
            <span className="category-card-check" aria-hidden="true">✓</span>
          </span>
        </button>
      ))}
    </div>
  )
}
