import { useEffect, useRef } from 'react'

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Cyber-funk vibrant color palette
    const CYBER_COLORS = ['#00f3ff', '#ff0077', '#9d00ff', '#00ff9d', '#ffc800', '#ff5500']

    // Particle nodes for high-tech cyber-funk network
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.2 + 1,
      alpha: Math.random() * 0.6 + 0.3,
      color: CYBER_COLORS[Math.floor(Math.random() * CYBER_COLORS.length)]
    }))

    let gridOffset = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // 1. Render Multi-Color Ambient Neon Nebula Spot Glows
      const time = Date.now() * 0.0008

      // Cyan Spot Top Left
      const gradCyan = ctx.createRadialGradient(
        width * 0.2 + Math.sin(time) * 40, height * 0.2 + Math.cos(time * 0.8) * 30, 0,
        width * 0.2, height * 0.2, 450
      )
      gradCyan.addColorStop(0, 'rgba(0, 243, 255, 0.08)')
      gradCyan.addColorStop(1, 'rgba(0, 243, 255, 0)')
      ctx.fillStyle = gradCyan
      ctx.fillRect(0, 0, width, height)

      // Magenta Spot Top Right
      const gradPink = ctx.createRadialGradient(
        width * 0.8 + Math.cos(time * 0.9) * 40, height * 0.25 + Math.sin(time) * 30, 0,
        width * 0.8, height * 0.25, 480
      )
      gradPink.addColorStop(0, 'rgba(255, 0, 119, 0.07)')
      gradPink.addColorStop(1, 'rgba(255, 0, 119, 0)')
      ctx.fillStyle = gradPink
      ctx.fillRect(0, 0, width, height)

      // Purple Spot Bottom Center
      const gradPurple = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 0.7) * 50, height * 0.85, 0,
        width * 0.5, height * 0.85, 550
      )
      gradPurple.addColorStop(0, 'rgba(157, 0, 255, 0.09)')
      gradPurple.addColorStop(1, 'rgba(157, 0, 255, 0)')
      ctx.fillStyle = gradPurple
      ctx.fillRect(0, 0, width, height)

      // Emerald Spot Bottom Left
      const gradGreen = ctx.createRadialGradient(
        width * 0.1, height * 0.8, 0,
        width * 0.1, height * 0.8, 380
      )
      gradGreen.addColorStop(0, 'rgba(0, 255, 157, 0.05)')
      gradGreen.addColorStop(1, 'rgba(0, 255, 157, 0)')
      ctx.fillStyle = gradGreen
      ctx.fillRect(0, 0, width, height)

      // 2. Animated Cyber Grid Lines
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.035)'
      ctx.lineWidth = 1
      const gridSize = 60

      gridOffset = (gridOffset + 0.25) % gridSize

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = gridOffset; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // 3. Cyber Particles & Node Connection Links
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.shadowBlur = 12
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0

        // Connect nearby nodes with laser lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color
            ctx.globalAlpha = (1 - dist / 110) * 0.2
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.95
      }}
    />
  )
}
