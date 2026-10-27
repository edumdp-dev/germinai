import { useEffect, useRef } from 'react'
// Monochrome orbit: pauses offscreen, in background tabs and for reduced motion.
export function ParticleField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const context = canvas.getContext('2d'); if (!context) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const points = Array.from({ length: 720 }, (_, index) => { const a = index % 60 / 60 * Math.PI * 2; const b = Math.floor(index / 60) / 12 * Math.PI * 2; const ring = .7 + .17 * Math.cos(b); return { x: ring * Math.cos(a), y: .17 * Math.sin(b), z: ring * Math.sin(a), size: index % 7 === 0 ? 2.2 : 1.3 } })
    let width = 0; let height = 0; let frame = 0; let lastDraw = 0; let angle = .35; let visible = false
    function draw() {
      if (!context || !width || !height) return
      context.clearRect(0, 0, width, height)
      const cos = Math.cos(angle); const sin = Math.sin(angle); const tiltCos = Math.cos(.66); const tiltSin = Math.sin(.66); const radius = Math.min(width, height) * .45
      for (const point of points) { const x = point.x * cos - point.z * sin; const z = point.x * sin + point.z * cos; const y = point.y * tiltCos - z * tiltSin; const depth = point.y * tiltSin + z * tiltCos; const perspective = 2.5 / (2.5 + depth); context.fillStyle = `rgba(240,240,240,${.22 + (1 - depth) * .28})`; context.fillRect(width / 2 + x * radius * perspective, height * .51 + y * radius * perspective, point.size * perspective, point.size * perspective) }
    }
    function tick(time: number) { if (time - lastDraw > 45) { angle += .003; draw(); lastDraw = time } frame = requestAnimationFrame(tick) }
    function sync() { cancelAnimationFrame(frame); if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick); else draw() }
    const resize = new ResizeObserver(([entry]) => { width = entry.contentRect.width; height = entry.contentRect.height; const ratio = Math.min(window.devicePixelRatio || 1, 1.5); canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); context.setTransform(ratio, 0, 0, ratio, 0, 0); draw() })
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    resize.observe(canvas); intersection.observe(canvas); motion.addEventListener('change', sync); document.addEventListener('visibilitychange', sync)
    return () => { cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); motion.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync) }
  }, [])
  return <canvas ref={canvasRef} className={`g-particle-field ${className}`} aria-hidden="true" />
}
