"use client"

// Adapted from the HeroCarousel supplied by the user via 21st:
// measured filmstrip, shared top edge, expanded active card.
import * as React from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion"
import { cn } from "@/lib/utils"

export interface HeroCarouselItem {
  id?: string | number
  title: string
  image: string
  credit?: string
  accent?: string
}

export interface HeroCarouselProps {
  items: HeroCarouselItem[]
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  autoplay?: boolean
  autoplayDelay?: number
  className?: string
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

export function HeroCarousel({
  items,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  autoplay = false,
  autoplayDelay = 4000,
  className,
}: HeroCarouselProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ w: 0, h: 0 })
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex)
  const [dragging, setDragging] = React.useState(false)
  const [paused, setPaused] = React.useState(false)
  const wheelState = React.useRef({ distance: 0, until: 0 })
  const suppressClickUntil = React.useRef(0)
  const reduced = useReducedMotion()

  const last = items.length - 1
  const index = clamp(controlled ?? uncontrolled, 0, Math.max(0, last))

  const go = React.useCallback((next: number) => {
    const nextIndex = clamp(next, 0, Math.max(0, last))
    if (controlled === undefined) setUncontrolled(nextIndex)
    if (nextIndex !== index) onIndexChange?.(nextIndex)
  }, [controlled, index, last, onIndexChange])

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () => setBox({ w: stage.clientWidth, h: stage.clientHeight })
    read()
    const observer = new ResizeObserver(read)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [items.length])

  const fullH = clamp(box.h * 0.65, 148, 228)
  const halfH = fullH / 2
  const cardW = fullH * 0.75
  const gap = Math.max(10, Math.round(cardW * 0.065))
  const step = cardW + gap
  const xFor = React.useCallback(
    (i: number) => box.w / 2 - (i * step + cardW / 2),
    [box.w, step, cardW],
  )
  const x = useMotionValue(0)
  const target = xFor(index)
  const spring = React.useMemo(() => reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 34, mass: 0.9 }, [reduced])

  React.useEffect(() => {
    if (dragging) return
    const animation = animate(x, target, spring)
    return () => animation.stop()
  }, [target, dragging, x, spring])

  // Horizontal gestures switch rubrics; vertical gestures keep scrolling the page.
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage || items.length < 2) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      const delta = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.w : 1)
      const stuck = (delta > 0 && index === last) || (delta < 0 && index === 0)
      if (stuck) {
        wheelState.current.distance = 0
        return
      }
      event.preventDefault()
      const state = wheelState.current
      if (event.timeStamp < state.until) return
      state.distance += delta
      if (Math.abs(state.distance) < 60) return
      go(index + Math.sign(state.distance))
      state.distance = 0
      state.until = event.timeStamp + 420
    }
    stage.addEventListener("wheel", onWheel, { passive: false })
    return () => stage.removeEventListener("wheel", onWheel)
  }, [go, index, last, items.length, box.w])

  React.useEffect(() => {
    if (!autoplay || reduced || paused || dragging || items.length < 2) return
    const timer = window.setTimeout(
      () => go(index === last ? 0 : index + 1),
      Math.max(1000, autoplayDelay),
    )
    return () => window.clearTimeout(timer)
  }, [autoplay, autoplayDelay, dragging, go, index, items.length, last, paused, reduced])

  if (!items.length) return null

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="group"
      aria-roledescription="карусель"
      aria-label="Рубрики новостей"
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        const keys: Record<string, number> = {
          ArrowLeft: index - 1,
          ArrowRight: index + 1,
          Home: 0,
          End: last,
        }
        if (!(event.key in keys)) return
        event.preventDefault()
        go(keys[event.key])
      }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
      className={cn("hero-carousel relative isolate w-full overflow-hidden select-none", className)}
    >
      <div className="absolute inset-x-0" style={{ top: "50%", marginTop: -(fullH + 32) / 2, height: fullH + 32 }}>
        <motion.div
          className="flex items-start"
          style={{ gap, x, cursor: dragging ? "grabbing" : "grab", touchAction: "pan-y" }}
          drag="x"
          dragMomentum={false}
          dragElastic={0.08}
          dragConstraints={{ left: xFor(last), right: xFor(0) }}
          onDragStart={() => { setDragging(true); suppressClickUntil.current = Infinity }}
          onDragEnd={(_, info) => {
            setDragging(false)
            suppressClickUntil.current = Date.now() + 300
            const thrown = x.get() + info.velocity.x * 0.12
            go(Math.round((box.w / 2 - thrown - cardW / 2) / step))
          }}
        >
          {items.map((item, itemIndex) => (
            <button
              key={item.id ?? itemIndex}
              type="button"
              aria-label={item.title.replace(/\n/g, " ")}
              aria-pressed={itemIndex === index}
              onClick={(event) => {
                if (event.detail > 0 && Date.now() < suppressClickUntil.current) return
                go(itemIndex)
              }}
              onFocus={() => {
                // Bring a card into view when reached with the keyboard.
                if (stageRef.current?.matches(":focus-within") && !dragging) go(itemIndex)
              }}
              className="film-card relative shrink-0 text-left"
              style={{ width: cardW }}
            >
              <motion.div
                className="film-card-image relative overflow-hidden"
                animate={{ height: itemIndex === index ? fullH : halfH }}
                transition={spring}
              >
                <img src={item.image} alt="" draggable={false} className="h-full w-full object-cover" style={{ objectPosition: "50% 40%" }} />
                <motion.span aria-hidden="true" className="absolute inset-0 bg-white" animate={{ opacity: itemIndex === index ? 0 : 0.22 }} transition={spring} />
              </motion.div>
              <span className="film-card-label">{item.title.replace(/\n/g, " ")}</span>
            </button>
          ))}
        </motion.div>
      </div>

    </div>
  )
}
