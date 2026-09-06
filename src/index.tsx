import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Props, Ref, PositionType, CursorType } from './types'

// Transform translateX ans translateY value property
const defaultPos: PositionType = [0, 0]

// Cursor style property
const defaultCursor = 'auto'

const PrismaZoom = forwardRef<Ref, Props>((props, forwardedRef) => {
  const {
    children,
    onPanChange,
    onZoomChange,
    minZoom = 1,
    initialZoom = 1,
    maxZoom = 5,
    scrollVelocity = 0.2,
    animDuration = 0.25,
    doubleTouchMaxDelay = 300,
    decelerationDuration = 750,
    allowZoom = true,
    allowPan = true,
    allowTouchEvents = false,
    allowParentPanning = false,
    allowWheel = true,
    ignoredMouseButtons = [],
    ...divProps
  } = props

  // Reference to the main element
  const ref = useRef<HTMLDivElement>(null)
  // Last request animation frame identifier
  const lastRequestAnimationIdRef = useRef<number | null>()
  // Last touch time in milliseconds
  const lastTouchTimeRef = useRef<number>()
  // Last double tap time (used to limit multiple double tap) in milliseconds
  const lastDoubleTapTimeRef = useRef<number>()
  // Last shifted position
  const lastShiftRef = useRef<PositionType | null>()
  // Last calculated distance between two fingers in pixels
  const lastTouchDistanceRef = useRef<number | null>()
  // Last cursor position
  const lastCursorRef = useRef<PositionType | null>()
  // Last touch position
  const lastTouchRef = useRef<PositionType | null>()
  // Current zoom level
  const zoomRef = useRef(initialZoom)
  // Current position
  const posRef = useRef(defaultPos)
  // Current transition duration
  const transitionRef = useRef(animDuration)

  const [cursor, setCursor] = useState<CursorType>(defaultCursor)

  const update = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transition = `transform ease-out ${transitionRef.current}s`
    ref.current.style.transform = `translate3d(${posRef.current[0]}px, ${posRef.current[1]}px, 0) scale(${zoomRef.current})`
  }, []);

  const setZoom = useCallback((zoom: number) => {
    zoomRef.current = zoom
    update()
    if (onZoomChange) {
      onZoomChange(zoom)
    }
  }, [update, onZoomChange]);

  const setPos = useCallback((pos: PositionType) => {
    posRef.current = pos
    update()
    if (onPanChange) {
      onPanChange({ posX: pos[0], posY: pos[1] })
    }
  }, [update, onPanChange]);

  const setTransitionDuration = useCallback((duration: number) => {
    transitionRef.current = duration
    update()
  }, [update]);

  /**
   * Returns the current zoom value.
   * @return {Number} Zoom value
   */
  const getZoom = useCallback(() => zoomRef.current, []);

  /**
   * Increments the zoom with the given value.
   * @param  {Number} value Zoom value
   */
  const zoomIn = useCallback((value: number) => {
    let newPosX = posRef.current[0]
    let newPosY = posRef.current[1]

    const prevZoom = zoomRef.current

    const newZoom = prevZoom + value < maxZoom ? prevZoom + value : maxZoom

    if (newZoom !== prevZoom) {
      newPosX = (newPosX * (newZoom - 1)) / (prevZoom > 1 ? prevZoom - 1 : prevZoom)
      newPosY = (newPosY * (newZoom - 1)) / (prevZoom > 1 ? prevZoom - 1 : prevZoom)
    }

    setZoom(newZoom)
    setPos([newPosX, newPosY])
    setTransitionDuration(animDuration)
  }, [setZoom, setPos, setTransitionDuration, animDuration, maxZoom]);

  /**
   * Decrements the zoom with the given value.
   * @param  {Number} value Zoom value
   */
  const zoomOut = useCallback((value: number) => {
    let newPosX = posRef.current[0]
    let newPosY = posRef.current[1]

    const prevZoom = zoomRef.current

    const newZoom = prevZoom - value > minZoom ? prevZoom - value : minZoom

    if (newZoom !== prevZoom) {
      newPosX = (newPosX * (newZoom - 1)) / (prevZoom - 1)
      newPosY = (newPosY * (newZoom - 1)) / (prevZoom - 1)
    }

    setZoom(newZoom)
    setPos([newPosX, newPosY])
    setTransitionDuration(animDuration)
  }, [setZoom, setPos, setTransitionDuration, animDuration, minZoom])

  /**
   * Zoom-in on the specified zone with the given relative coordinates and dimensions.
   * @param  {Number} relX      Relative X position of the zone left-top corner in pixels
   * @param  {Number} relY      Relative Y position of the zone left-top corner in pixels
   * @param  {Number} relWidth  Zone width in pixels
   * @param  {Number} relHeight Zone height in pixels
   */
  const zoomToZone = useCallback((relX: number, relY: number, relWidth: number, relHeight: number) => {
    if (!ref.current) return

    let newPosX = posRef.current[0]
    let newPosY = posRef.current[1]
    const parentRect = (ref.current?.parentNode as HTMLElement).getBoundingClientRect()

    const prevZoom = zoomRef.current

    // Calculate zoom factor to scale the zone
    const optimalZoomX = parentRect.width / relWidth
    const optimalZoomY = parentRect.height / relHeight
    const newZoom = Math.min(optimalZoomX, optimalZoomY, maxZoom)

    // Calculate new position to center the zone
    const rect = ref.current.getBoundingClientRect()
    const [centerX, centerY] = [rect.width / prevZoom / 2, rect.height / prevZoom / 2]
    const [zoneCenterX, zoneCenterY] = [relX + relWidth / 2, relY + relHeight / 2]
    newPosX = (centerX - zoneCenterX) * newZoom
    newPosY = (centerY - zoneCenterY) * newZoom

    setZoom(newZoom)
    setPos([newPosX, newPosY])
    setTransitionDuration(animDuration)
  }, [setZoom, setPos, setTransitionDuration, animDuration, maxZoom])

  /**
   * Calculates new translate positions for CSS transformations.
   * @param  {Number} x     Relative (rect-based) X position in pixels
   * @param  {Number} y     Relative (rect-based) Y position in pixels
   * @param  {Number} zoom  Scale value
   * @return {Array}        New X and Y positions
   */
  const getNewPosition = useCallback((x: number, y: number, newZoom: number): PositionType => {
    const [prevZoom, prevPosX, prevPosY] = [zoomRef.current, posRef.current[0], posRef.current[1]]

    if (newZoom === 1 || !ref.current) return [0, 0]

    if (newZoom > prevZoom) {
      // Get container coordinates
      const rect = ref.current.getBoundingClientRect()

      // Retrieve rectangle dimensions and mouse position
      const [centerX, centerY] = [rect.width / 2, rect.height / 2]
      const [relativeX, relativeY] = [x - rect.left - window.pageXOffset, y - rect.top - window.pageYOffset]

      // If we are zooming down, we must try to center to mouse position
      const [absX, absY] = [(centerX - relativeX) / prevZoom, (centerY - relativeY) / prevZoom]
      const ratio = newZoom - prevZoom
      return [prevPosX + absX * ratio, prevPosY + absY * ratio]
    } else {
      // If we are zooming down, we shall re-center the element
      return [(prevPosX * (newZoom - 1)) / (prevZoom - 1), (prevPosY * (newZoom - 1)) / (prevZoom - 1)]
    }
  }, [])

  /**
   * Applies a full-zoom on the specified X and Y positions
   * @param  {Number} x Relative (rect-based) X position in pixels
   * @param  {Number} y Relative (rect-based) Y position in pixels
   */
  const fullZoomInOnPosition = useCallback((x: number, y: number) => {
    const zoom = maxZoom

    setPos(getNewPosition(x, y, zoom))
    setZoom(zoom)
    setTransitionDuration(animDuration)
  }, [setPos, setZoom, setTransitionDuration, getNewPosition, animDuration, maxZoom])

  /**
   * Calculates the narrowed shift for panning actions.
   * @param  {Number} shift      Initial shift in pixels
   * @param  {Number} minLimit   Minimum limit (left or top) in pixels
   * @param  {Number} maxLimit   Maximum limit (right or bottom) in pixels
   * @param  {Number} minElement Left or top element position in pixels
   * @param  {Number} maxElement Right or bottom element position in pixels
   * @return {Number}            Narrowed shift
   */
  const getLimitedShift = useCallback((
    shift: number,
    minLimit: number,
    maxLimit: number,
    minElement: number,
    maxElement: number
  ) => {
    if (shift > 0) {
      if (minElement > minLimit) {
        // Forbid move if we are moving to left or top while we are already out minimum boudaries
        return 0
      } else if (minElement + shift > minLimit) {
        // Lower the shift if we are going out boundaries
        return minLimit - minElement
      }
    } else if (shift < 0) {
      if (maxElement < maxLimit) {
        // Forbid move if we are moving to right or bottom while we are already out maximum boudaries
        return 0
      } else if (maxElement + shift < maxLimit) {
        // Lower the shift if we are going out boundaries
        return maxLimit - maxElement
      }
    }

    return shift
  }, [])

  const getCursor = useCallback((canMoveOnX: boolean, canMoveOnY: boolean) => {
    if (canMoveOnX && canMoveOnY) {
      return 'move'
    } else if (canMoveOnX) {
      return 'ew-resize'
    } else if (canMoveOnY) {
      return 'ns-resize'
    } else {
      return 'auto'
    }
  }, [])

  /**
   * Moves the element by incrementing its position with given X and Y values.
   * @param  {Number} shiftX             Position change to apply on X axis in pixels
   * @param  {Number} shiftY             Position change to apply on Y axis in pixels
   * @param  {Number} transitionDuration Transition duration (in seconds)
   */
  const move = useCallback((shiftX: number, shiftY: number, transitionDuration = 0) => {
    if (!ref.current) return
    let newPosX = posRef.current[0]
    let newPosY = posRef.current[1]

    // Get container and container's parent coordinates
    const rect = ref.current.getBoundingClientRect()
    const parentRect = (ref.current.parentNode as HTMLElement).getBoundingClientRect()

    const [isLarger, isOutLeftBoundary, isOutRightBoundary] = [
      // Check if the element is larger than its container
      rect.width > parentRect.right - parentRect.left,
      // Check if the element is out its container left boundary
      shiftX > 0 && rect.left - parentRect.left < 0,
      // Check if the element is out its container right boundary
      shiftX < 0 && rect.right - parentRect.right > 0,
    ]

    const canMoveOnX = isLarger || isOutLeftBoundary || isOutRightBoundary
    if (canMoveOnX) {
      newPosX += getLimitedShift(shiftX, parentRect.left, parentRect.right, rect.left, rect.right)
    }

    const [isHigher, isOutTopBoundary, isOutBottomBoundary] = [
      // Check if the element is higher than its container
      rect.height > parentRect.bottom - parentRect.top,
      // Check if the element is out its container top boundary
      shiftY > 0 && rect.top - parentRect.top < 0,
      // Check if the element is out its container bottom boundary
      shiftY < 0 && rect.bottom - parentRect.bottom > 0,
    ]

    const canMoveOnY = isHigher || isOutTopBoundary || isOutBottomBoundary
    if (canMoveOnY) {
      newPosY += getLimitedShift(shiftY, parentRect.top, parentRect.bottom, rect.top, rect.bottom)
    }

    const cursor = getCursor(canMoveOnX, canMoveOnY)

    setPos([newPosX, newPosY])
    setCursor(cursor)
    setTransitionDuration(transitionDuration)
  }, [setPos, setCursor, setTransitionDuration, getCursor, getLimitedShift])

  /**
   * Check if the user is doing a double tap gesture.
   * @return {Boolean} Result of the checking
   */
  const isDoubleTapping = useCallback(() => {
    const touchTime = new Date().getTime()
    const isDoubleTap =
      touchTime - (lastTouchTimeRef.current ?? 0) < doubleTouchMaxDelay &&
      touchTime - (lastDoubleTapTimeRef.current ?? 0) > doubleTouchMaxDelay

    if (isDoubleTap) {
      lastDoubleTapTimeRef.current = touchTime
      return true
    }

    lastTouchTimeRef.current = touchTime
    return false
  }, [doubleTouchMaxDelay])

  /**
   * Trigger a decelerating movement after a mouse up or a touch end event, using the last movement shift.
   * @param  {Number} lastShiftOnX Last shift on the X axis in pixels
   * @param  {Number} lastShiftOnY Last shift on the Y axis in pixels
   */
  const startDeceleration = useCallback((lastShiftOnX: number, lastShiftOnY: number) => {
    let startTimestamp: number | null = null

    const startDecelerationMove = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp

      const progress = timestamp - startTimestamp

      // Calculates the ratio to apply on the move (used to create a non-linear deceleration)
      const ratio = (decelerationDuration - progress) / decelerationDuration

      const [shiftX, shiftY] = [lastShiftOnX * ratio, lastShiftOnY * ratio]

      // Continue animation only if time has not expired and if there is still some movement (more than 1 pixel on one axis)
      if (progress < decelerationDuration && Math.max(Math.abs(shiftX), Math.abs(shiftY)) > 1) {
        move(shiftX, shiftY, 0)
        lastRequestAnimationIdRef.current = requestAnimationFrame(startDecelerationMove)
      } else {
        lastRequestAnimationIdRef.current = null
      }
    }

    lastRequestAnimationIdRef.current = requestAnimationFrame(startDecelerationMove)
  }, [move, decelerationDuration])

  /**
   * Resets the component to its initial state.
   */
  const reset = useCallback(() => {
    setZoom(initialZoom)
    setCursor(defaultCursor)
    setTransitionDuration(animDuration)
    setPos(defaultPos)
  }, [setZoom, setCursor, setTransitionDuration, setPos, initialZoom, animDuration]);

  /**
   * Event handler on double click.
   * @param  {MouseEvent} event Mouse event
   */
  const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!allowZoom) return

    if (zoomRef.current === minZoom) {
      fullZoomInOnPosition(event.pageX, event.pageY)
    } else {
      reset()
    }
  }, [fullZoomInOnPosition, reset, allowZoom, minZoom])

  /**
   * Event handler on scroll.
   * @param  {MouseEvent} event Mouse event
   */
  const handleMouseWheel = useCallback((event: WheelEvent) => {
    if (!allowZoom || !allowWheel) return
    event.preventDefault()

    // Use the scroll event delta to determine the zoom velocity
    const velocity = (-event.deltaY * scrollVelocity) / 100

    // Set the new zoom level
    const newZoom = Math.max(Math.min(zoomRef.current + velocity, maxZoom), minZoom)

    let newPosition = posRef.current
    if (newZoom !== zoomRef.current) {
      newPosition = newZoom !== minZoom ? getNewPosition(event.pageX, event.pageY, newZoom) : defaultPos
    }

    setZoom(newZoom)
    setPos(newPosition)
    setTransitionDuration(0.05)
  }, [getNewPosition, setZoom, setPos, setTransitionDuration, allowZoom, allowWheel, maxZoom, minZoom, scrollVelocity])

  /**
   * Event handler on mouse down.
   * @param  {MouseEvent} event Mouse event
   */
  const handleMouseStart = useCallback((event: MouseEvent) => {
    event.preventDefault()
    if (!allowPan || ignoredMouseButtons.includes(event.button)) return

    if (lastRequestAnimationIdRef.current) cancelAnimationFrame(lastRequestAnimationIdRef.current)
    lastCursorRef.current = [event.pageX, event.pageY]
  }, [allowPan, ignoredMouseButtons]);

  /**
   * Event handler on mouse move.
   * @param  {MouseEvent} event Mouse event
   */
  const handleMouseMove = useCallback((event: MouseEvent) => {
    event.preventDefault()

    if (!allowPan || !lastCursorRef.current) return

    const [posX, posY] = [event.pageX, event.pageY]
    const shiftX = posX - lastCursorRef.current[0]
    const shiftY = posY - lastCursorRef.current[1]

    move(shiftX, shiftY, 0)

    lastCursorRef.current = [posX, posY]
    lastShiftRef.current = [shiftX, shiftY]
  }, [move, allowPan]);

  /**
   * Event handler on mouse up or mouse out.
   * @param  {MouseEvent} event Mouse event
   */
  const handleMouseStop = useCallback((event: MouseEvent) => {
    event.preventDefault()

    if (lastShiftRef.current) {
      // Use the last shift to make a decelerating movement effect
      startDeceleration(lastShiftRef.current[0], lastShiftRef.current[1])
      lastShiftRef.current = null
    }

    lastCursorRef.current = null
    setCursor('auto')
  }, [startDeceleration])

  /**
   * Event handler on touch start.
   * Zoom-in at the maximum scale if a double tap is detected.
   * @param  {TouchEvent} event Touch event
   */
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const isThisDoubleTapping = isDoubleTapping()
    const isMultiTouch = event.touches.length > 1

    if (!allowTouchEvents) event.preventDefault()

    if (lastRequestAnimationIdRef.current) cancelAnimationFrame(lastRequestAnimationIdRef.current)

    const [posX, posY] = [event.touches[0].pageX, event.touches[0].pageY]

    if (isMultiTouch) {
      lastTouchRef.current = [posX, posY]
      return
    }

    if (isThisDoubleTapping && allowZoom) {
      if (zoomRef.current === minZoom) {
        fullZoomInOnPosition(posX, posY)
      } else {
        reset()
      }

      return
    }

    // Don't save the last touch if we are starting a simple touch move while panning is disabled
    if (allowPan) lastTouchRef.current = [posX, posY]
  }, [
    fullZoomInOnPosition,
    reset,
    isDoubleTapping,
    allowZoom,
    allowTouchEvents,
    allowPan,
    minZoom
  ])

  /**
   * Event handler on touch move.
   * Either move the element using one finger or zoom-in with a two finger pinch.
   * @param  {TouchEvent} event Touch move
   */
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!allowTouchEvents) event.preventDefault()
    if (!lastTouchRef.current) return

    if (event.touches.length === 1) {
      const [posX, posY] = [event.touches[0].pageX, event.touches[0].pageY]
      // If we detect only one point, we shall just move the element
      const shiftX = posX - lastTouchRef.current[0]
      const shiftY = posY - lastTouchRef.current[1]

      move(shiftX, shiftY)
      lastShiftRef.current = [shiftX, shiftY]

      // Save data for the next move
      lastTouchRef.current = [posX, posY]
      lastTouchDistanceRef.current = null
    } else if (event.touches.length > 1) {
      let newZoom = zoomRef.current
      // If we detect two points, we shall zoom up or down
      const [pos1X, pos1Y] = [event.touches[0].pageX, event.touches[0].pageY]
      const [pos2X, pos2Y] = [event.touches[1].pageX, event.touches[1].pageY]
      const distance = Math.sqrt(Math.pow(pos2X - pos1X, 2) + Math.pow(pos2Y - pos1Y, 2))

      if (lastTouchDistanceRef.current && distance && distance !== lastTouchDistanceRef.current) {
        if (allowZoom) {
          newZoom += (distance - lastTouchDistanceRef.current) / 100
          if (newZoom > maxZoom) {
            newZoom = maxZoom
          } else if (newZoom < minZoom) {
            newZoom = minZoom
          }
        }

        // Change position using the center point between the two fingers
        const [centerX, centerY] = [(pos1X + pos2X) / 2, (pos1Y + pos2Y) / 2]
        const newPos = getNewPosition(centerX, centerY, newZoom)

        setZoom(newZoom)
        setPos(newPos)
        setTransitionDuration(0)
      }

      // Save data for the next move
      lastTouchRef.current = [pos1X, pos1Y]
      lastTouchDistanceRef.current = distance
    }
  }, [
    getNewPosition,
    move,
    setPos,
    setTransitionDuration,
    setZoom,
    allowZoom,
    allowTouchEvents,
    maxZoom,
    minZoom
  ])

  /**
   * Event handler on touch end or touch cancel.
   * @param  {TouchEvent} event Touch move
   */
  const handleTouchStop = useCallback(() => {
    if (lastShiftRef.current) {
      // Use the last shift to make a decelerating movement effect
      startDeceleration(lastShiftRef.current[0], lastShiftRef.current[1])
      lastShiftRef.current = null
    }

    lastTouchRef.current = null
    lastTouchDistanceRef.current = null
  }, [startDeceleration])

  // Imperative Ref methods
  useImperativeHandle(forwardedRef, () => ({
    getZoom,
    zoomIn,
    reset,
    move,
    zoomOut,
    zoomToZone,
    setZoom,
    setPos,
  }))

  useEffect(() => {
    const refCurrentValue = ref.current
    const hasMouseDevice = window.matchMedia('(pointer: fine)').matches

    refCurrentValue?.addEventListener('wheel', handleMouseWheel, { passive: false })
    if (hasMouseDevice) {
      // Apply mouse events only to devices which include an accurate pointing device
      refCurrentValue?.addEventListener('mousedown', handleMouseStart, { passive: false })
      refCurrentValue?.addEventListener('mousemove', handleMouseMove, { passive: false })
      refCurrentValue?.addEventListener('mouseup', handleMouseStop, { passive: false })
      refCurrentValue?.addEventListener('mouseleave', handleMouseStop, { passive: false })
    } else {
      // Apply touch events to all other devices
      refCurrentValue?.addEventListener('touchstart', handleTouchStart, { passive: false })
      refCurrentValue?.addEventListener('touchmove', handleTouchMove, { passive: false })
      refCurrentValue?.addEventListener('touchend', handleTouchStop, { passive: false })
      refCurrentValue?.addEventListener('touchcancel', handleTouchStop, { passive: false })
    }

    return () => {
      refCurrentValue?.removeEventListener('wheel', handleMouseWheel)
      if (hasMouseDevice) {
        refCurrentValue?.removeEventListener('mousedown', handleMouseStart)
        refCurrentValue?.removeEventListener('mousemove', handleMouseMove)
        refCurrentValue?.removeEventListener('mouseup', handleMouseStop)
        refCurrentValue?.removeEventListener('mouseleave', handleMouseStop)
      } else {
        refCurrentValue?.removeEventListener('touchstart', handleTouchStart)
        refCurrentValue?.removeEventListener('touchmove', handleTouchMove)
        refCurrentValue?.removeEventListener('touchend', handleTouchStop)
        refCurrentValue?.removeEventListener('touchcancel', handleTouchStop)
      }
    }
  }, [
    handleMouseWheel,
    handleMouseStart,
    handleMouseMove,
    handleMouseStop,
    handleTouchStart,
    handleTouchMove,
    handleTouchStop
  ])

  const attr = {
    ...divProps,
    ref,
    onDoubleClick: handleDoubleClick,
    style: {
      ...divProps.style,
      cursor: cursor,
      willChange: 'transform',
      transition: `transform ease-out ${transitionRef.current}s`,
      touchAction: allowParentPanning && zoomRef.current === 1 ? 'pan-x pan-y' : 'none',
      transform: `translate3d(${posRef.current[0]}px, ${posRef.current[1]}px, 0) scale(${zoomRef.current})`,
    },
  }

  return <div {...attr}>{children}</div>
})

export default PrismaZoom
