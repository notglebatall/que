"use client"

import * as React from "react"
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion"
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
  ariaLabel?: string
  ariaControls?: string
  className?: string
}

// The stage is exactly as tall as an expanded card.
const CARD_AR = 0.75
const GAP = 0.038
const WHEEL_THRESHOLD = 60
const WHEEL_COOLDOWN = 420
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function HeroCarousel({
  items,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  autoplay = false,
  autoplayDelay = 4000,
  ariaLabel = "Выбор темы",
  ariaControls,
  className,
}: HeroCarouselProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([])
  const positioned = React.useRef(false)
  const wheel = React.useRef({ accumulated: 0, until: 0 })
  const [box, setBox] = React.useState({ w: 0, h: 0 })
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex)
  const [dragging, setDragging] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const reduced = useReducedMotion()
  const hasItems = items.length > 0
  const last = items.length - 1
  const index = clamp(controlled ?? uncontrolled, 0, Math.max(0, last))

  const go = React.useCallback((next: number) => {
    const clamped = clamp(next, 0, Math.max(0, last))
    if (controlled === undefined) setUncontrolled(clamped)
    if (clamped !== index) onIndexChange?.(clamped)
  }, [controlled, index, last, onIndexChange])

  React.useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () => {
      const rect = stage.getBoundingClientRect()
      setBox({ w: rect.width, h: rect.height })
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [hasItems])

  const fullH = box.h || 136
  const cardW = fullH * CARD_AR
  const gap = Math.max(4, Math.round(cardW * GAP))
  const step = cardW + gap
  const xFor = React.useCallback((i: number) => box.w / 2 - (i * step + cardW / 2), [box.w, step, cardW])
  const x = useMotionValue(0)
  const target = xFor(index)
  const spring = React.useMemo(() => reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 34, mass: 0.9 }, [reduced])

  React.useLayoutEffect(() => {
    if (dragging || !box.w) return
    if (!positioned.current) {
      x.set(target)
      positioned.current = true
      return
    }
    const run = animate(x, target, spring)
    return () => run.stop()
  }, [target, dragging, box.w, x, spring])

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage || items.length < 2) return
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.defaultPrevented) return
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      const delta = raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.h : 1)
      if (!delta) return
      // At either end, hand scrolling back to the page.
      if ((delta > 0 && index === last) || (delta < 0 && index === 0)) {
        wheel.current.accumulated = 0
        return
      }
      event.preventDefault()
      if (event.timeStamp < wheel.current.until) return
      if (Math.sign(delta) !== Math.sign(wheel.current.accumulated)) wheel.current.accumulated = 0
      wheel.current.accumulated += delta
      if (Math.abs(wheel.current.accumulated) < WHEEL_THRESHOLD) return
      go(index + Math.sign(wheel.current.accumulated))
      wheel.current.accumulated = 0
      wheel.current.until = event.timeStamp + WHEEL_COOLDOWN
    }
    stage.addEventListener("wheel", onWheel, { passive: false })
    return () => stage.removeEventListener("wheel", onWheel)
  }, [go, index, last, items.length, box.h])

  React.useEffect(() => {
    if (!autoplay || reduced || hovered || focused || dragging || items.length < 2) return
    const timer = window.setTimeout(() => go(index === last ? 0 : index + 1), autoplayDelay)
    return () => window.clearTimeout(timer)
  }, [autoplay, autoplayDelay, dragging, focused, go, hovered, index, items.length, last, reduced])

  if (!items.length) return null

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="group"
      aria-roledescription="карусель"
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        const keys: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last }
        if (!(event.key in keys)) return
        event.preventDefault()
        const next = clamp(keys[event.key], 0, last)
        go(next)
        if (buttons.current.includes(document.activeElement as HTMLButtonElement)) {
          buttons.current[next]?.focus({ preventScroll: true })
        }
      }}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true) }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
      className={cn("hero-carousel relative w-full overflow-clip select-none", className)}
    >
      <div className="absolute inset-x-0 top-0" style={{ height: fullH }}>
        <motion.div
          className="flex items-start"
          style={{ gap, x, cursor: dragging ? "grabbing" : "grab", touchAction: "pan-y", visibility: box.w ? "visible" : "hidden" }}
          drag="x" dragMomentum={false} dragElastic={0.08}
          dragConstraints={{ left: xFor(last), right: xFor(0) }}
          onDragStart={() => { x.stop(); setDragging(true) }}
          onDragEnd={(_, info) => {
            setDragging(false)
            const thrown = x.get() + info.velocity.x * 0.12
            go(Math.round((box.w / 2 - thrown - cardW / 2) / step))
          }}
        >
          {items.map((item, i) => (
            <motion.button
              key={item.id ?? i}
              ref={(element) => { buttons.current[i] = element }}
              type="button" aria-label={item.title.replace(/\n/g, " ")} aria-pressed={i === index} aria-controls={ariaControls}
              tabIndex={i === index ? 0 : -1}
              onClick={() => go(i)}
              className="hero-slide relative shrink-0 overflow-hidden rounded-none bg-white/5"
              style={{ width: cardW, height: i === index ? fullH : fullH / 2 }}
            >
              <img src={item.image} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover" style={{ objectPosition: "50% 26%" }} />
              <span aria-hidden="true" className="hero-slide-shade absolute inset-0 bg-black" style={{ opacity: i === index ? 0 : 0.18 }} />
              <span className="hero-slide-label">{item.title.replace(/\n/g, " ")}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
