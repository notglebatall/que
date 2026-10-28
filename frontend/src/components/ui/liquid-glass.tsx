"use client"

import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassEffectProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  as?: "div" | "header"
  contentClassName?: string
  style?: CSSProperties
}

// Keep the distortion on the backdrop so text and controls stay sharp.
export function GlassEffect({
  children,
  as: Tag = "div",
  className,
  contentClassName,
  style,
  ...props
}: GlassEffectProps) {
  const filterId = `glass-distortion-${useId().replace(/:/g, "")}`

  return (
    <Tag className={cn("liquid-glass", className)} style={style} {...props}>
      <GlassFilter id={filterId} />
      <div
        aria-hidden="true"
        className="liquid-glass-backdrop"
        style={{ filter: `url(#${filterId})` }}
      />
      <div aria-hidden="true" className="liquid-glass-tint" />
      <div aria-hidden="true" className="liquid-glass-highlight" />
      <div className={cn("liquid-glass-content", contentClassName)}>{children}</div>
    </Tag>
  )
}

export function GlassFilter({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="liquid-glass-filter"
    >
      <defs>
        <filter id={id} x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.001 0.005"
            numOctaves="1"
            seed="17"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="200"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
