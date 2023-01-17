export type Ref = {
  getZoom: () => number
  zoomIn: (zoom: number) => void
  zoomOut: (zoom: number) => void
  reset: VoidFunction
  zoomToZone: (relX: number, relY: number, relWidth: number, relHeight: number) => void
}

export type Props = NonNullable<React.PropsWithChildren> &
  React.HTMLAttributes<HTMLDivElement> & {
    /**  Minimum zoom ratio */
    minZoom?: number
    /**
     * Maximum zoom ratio
     */
    maxZoom?: number
    /**
     * Initial zoom ratio
     */
    initialZoom?: number
    /**
     * Zoom increment or decrement on each scroll wheel detection
     */
    scrollVelocity?: number
    /**
     * Function called each time the zoom value changes
     */
    onZoomChange?: (zoom: number) => void
    /**
     * Function called each time the posX or posY value changes (aka images was panned)
     */
    onPanChange?: (props: { posX: number; posY: number }) => void
    /**
     * Animation duration (in seconds)
     */
    animDuration?: number
    /**
     * Max delay between two taps to consider a double tap (in milliseconds)
     */
    doubleTouchMaxDelay?: number
    /**
     * Decelerating movement duration after a mouse up or a touch end event (in milliseconds)
     */
    decelerationDuration?: number
    /**
     * Enable or disable zooming in place
     */
    allowZoom?: boolean
    /**
     * Enable or disable panning in place
     */
    allowPan?: boolean
    /**
     * By default, all touch events are caught (if set to true touch events propagate)
     */
    allowTouchEvents?: boolean
    /**
     * By default, page cannot scroll with touch events
     */
    allowParentPanning?: boolean
    /**
     * Enable or disable mouse wheel and touchpad zooming in place
     */
    allowWheel?: boolean
  }

export type PositionType = [number, number]

export type CursorType = React.CSSProperties['cursor']
