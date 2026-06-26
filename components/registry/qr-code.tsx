import { cn } from "@/lib/utils"

// Deterministic faux-QR pattern generated from a seed string.
function seededGrid(seed: string, size = 21) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  const cells: boolean[] = []
  let state = Math.abs(h) || 1
  for (let i = 0; i < size * size; i++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    cells.push((state >> 8) % 2 === 0)
  }
  return cells
}

function isFinder(row: number, col: number, size: number) {
  const inTL = row < 7 && col < 7
  const inTR = row < 7 && col >= size - 7
  const inBL = row >= size - 7 && col < 7
  return inTL || inTR || inBL
}

export function QrCode({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const size = 21
  const grid = seededGrid(value, size)

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("size-full", className)}
      role="img"
      aria-label="Registry QR code"
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="white" />
      {grid.map((on, i) => {
        const row = Math.floor(i / size)
        const col = i % size
        if (isFinder(row, col, size)) return null
        if (!on) return null
        return (
          <rect
            key={i}
            x={col}
            y={row}
            width={1}
            height={1}
            fill="oklch(0.24 0.012 60)"
          />
        )
      })}
      {/* Finder patterns */}
      {[
        [0, 0],
        [0, size - 7],
        [size - 7, 0],
      ].map(([r, c], idx) => (
        <g key={idx} fill="oklch(0.24 0.012 60)">
          <rect x={c} y={r} width={7} height={7} />
          <rect x={c + 1} y={r + 1} width={5} height={5} fill="white" />
          <rect x={c + 2} y={r + 2} width={3} height={3} />
        </g>
      ))}
    </svg>
  )
}
