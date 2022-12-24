export type PrismaZoomRef = {
  getZoom: () => number
  zoomIn: (zoom: number) => void
  zoomOut: (zoom: number) => void
  reset: VoidFunction
  zoomToZone: (relX: number, relY: number, relWidth: number, relHeight: number) => void
}

export type PrismaZoomProps = NonNullable<React.PropsWithChildren> &
  React.HTMLAttributes<HTMLDivElement> & {
    minZoom?: number
    maxZoom?: number
    initialZoom?: number
    scrollVelocity?: number
    onZoomChange?: (zoom: number) => void
    onPanChange?: (props: { posX: number; posY: number }) => void
    animDuration?: number
    doubleTouchMaxDelay?: number
    decelerationDuration?: number
    allowZoom?: boolean
    allowPan?: boolean
    allowTouchEvents?: boolean
    allowParentPanning?: boolean
  }

export type PositionTypeSimplified = {
  y: number
  x: number
}

export type PositionType = {
  posY: number
  posX: number
}

export type CursorType = React.CSSProperties['cursor']
