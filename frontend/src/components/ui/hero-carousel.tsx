"use client"

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface HeroCarouselItem {
  id?: string | number
  title: string
  image: string
  credit?: string
  meta?: string[]
  accent?: string
}

export interface HeroCarouselProps {
  items: HeroCarouselItem[]
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  brand?: React.ReactNode
  onBack?: () => void
  onMenu?: () => void
  autoplay?: boolean
  autoplayDelay?: number
  ariaLabel?: string
  ariaControls?: string
  className?: string
}

// Geometry follows the measured stage, as in the reference filmstrip.
const CARD_H = 0.264
const CARD_AR = 0.75
const GAP = 0.038
const STRIP_TOP = 0.5
const TITLE = 0.067
const WHEEL_THRESHOLD = 60
const WHEEL_COOLDOWN = 420
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function HeroCarousel({
  items,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  brand,
  onBack,
  onMenu,
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
    const read = () => setBox({ w: stage.clientWidth, h: stage.clientHeight })
    read()
    const observer = new ResizeObserver(read)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [hasItems])

  const fullH = clamp(box.h * CARD_H, 128, 360)
  const cardW = fullH * CARD_AR
  const gap = Math.max(4, Math.round(cardW * GAP))
  const step = cardW + gap
  const pad = Math.max(24, Math.round(box.w * 0.033))
  const label = Math.max(11, Math.round(box.h * 0.0103))
  const xFor = React.useCallback((i: number) => box.w / 2 - (i * step + cardW / 2), [box.w, step, cardW])
  const x = useMotionValue(0)
  const target = xFor(index)
  const spring = React.useMemo(() => reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 34, mass: 0.9 }, [reduced])
  const swing = { duration: reduced ? 0 : 0.7, ease: "easeOut" as const }

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

  const active = items[index]
  if (!active) return null
  const accent = active.accent ?? "#8a8a8a"

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
      className={cn("hero-carousel relative min-h-[32rem] w-full overflow-clip bg-black text-white select-none", className)}
    >
      <AnimatePresence initial={false}>
        <motion.div key={active.id ?? index} aria-hidden="true" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={swing}>
          <motion.img
            src={active.image} alt="" draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: reduced ? 1.28 : 1.42 }} animate={{ scale: 1.28 }}
            transition={reduced ? { duration: 0 } : { duration: 6, ease: "linear" }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: accent, mixBlendMode: "color" }} />
          <div className="absolute inset-0 opacity-55" style={{ backgroundColor: accent, mixBlendMode: "multiply" }} />
        </motion.div>
      </AnimatePresence>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-black/70" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }} />

      <div className="absolute inset-x-0 flex items-center justify-center gap-8" style={{ top: Math.max(24, box.h * 0.04), paddingInline: pad, fontSize: label }}>
        {onBack && <button type="button" className="hero-text-button" onClick={onBack}><span aria-hidden="true">↖</span> Назад</button>}
        {brand && <div className="font-medium tracking-[0.16em] uppercase">{brand}</div>}
        {onMenu && <button type="button" className="hero-text-button" onClick={onMenu}>Меню <span aria-hidden="true">☰</span></button>}
      </div>

      <div className="absolute inset-x-0 top-0 flex flex-col justify-end" style={{ height: `${STRIP_TOP * 100}%`, paddingInline: pad, paddingBottom: Math.round(box.h * 0.035) }}>
        <div className="flex w-full flex-wrap items-end gap-x-[6vw] gap-y-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h2 key={active.id ?? index} className="hero-title font-semibold leading-[0.96] tracking-[-0.04em]" style={{ fontSize: Math.max(32, Math.round(box.h * TITLE)) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={swing}>
              {active.title.split("\n").map((line, i) => (
                <span key={i} className="block overflow-hidden pb-[0.08em]">
                  <motion.span className="block" initial={{ y: reduced ? 0 : "110%" }} animate={{ y: 0 }} transition={reduced ? { duration: 0 } : { duration: 0.62, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}>{line}</motion.span>
                </span>
              ))}
            </motion.h2>
          </AnimatePresence>
          {active.credit && <motion.p key={`credit-${index}`} className="hero-credit" style={{ fontSize: Math.max(12, label) }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={swing}>{active.credit}</motion.p>}
          {!!active.meta?.length && <div className="ml-auto flex flex-wrap gap-4 font-mono uppercase" style={{ fontSize: label }}>{active.meta.map((fact, i) => <span key={i}>{fact}</span>)}</div>}
        </div>
      </div>

      <div className="absolute inset-x-0" style={{ top: `${STRIP_TOP * 100}%`, height: fullH }}>
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
              <span className="hero-slide-label"><span>{item.title.replace(/\n/g, " ")}</span>{i === index && <span aria-hidden="true">✓</span>}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <div className="absolute" style={{ left: pad, bottom: Math.max(28, box.h * 0.045), width: Math.max(88, box.w * 0.2) }}>
        <div className="flex justify-between font-mono tabular-nums" style={{ fontSize: label }}><span>{String(index + 1).padStart(2, "0")}</span><span>{String(items.length).padStart(2, "0")}</span></div>
        <div className="relative mt-3 h-px w-full bg-white/30"><motion.div className="absolute inset-y-0 bg-white" style={{ width: `${100 / items.length}%` }} animate={{ left: `${(index / items.length) * 100}%` }} transition={spring} /></div>
      </div>
      <div className="absolute flex gap-2" style={{ right: pad, bottom: Math.max(24, box.h * 0.04) }}>
        <button type="button" className="hero-arrow" aria-label="Предыдущая тема" disabled={index === 0} onClick={() => go(index - 1)}><span aria-hidden="true">←</span></button>
        <button type="button" className="hero-arrow" aria-label="Следующая тема" disabled={index === last} onClick={() => go(index + 1)}><span aria-hidden="true">→</span></button>
      </div>
    </div>
  )
}
