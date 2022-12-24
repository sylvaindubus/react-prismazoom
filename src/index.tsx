import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { CursorType, PositionType, PositionTypeSimplified, PrismaZoomProps, PrismaZoomRef } from './types'

const DEFAULT_STATE = {
  // Transform translateX value property
  posX: 0,
  // Transform translateY value property
  posY: 0,
  // Cursor style property
  cursor: 'auto',
}

const HAS_MOUSE_DEVICE = window.matchMedia('(pointer: fine)').matches

const PrismaZoom = forwardRef<PrismaZoomRef, PrismaZoomProps>((props, forwardedRef) => {
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
    ...divProps
  } = props

  const ref = useRef<HTMLDivElement>(null)

  const lastRequestAnimationIdRef = useRef<number | null>()
  const lastTouchTimeRef = useRef<number>()
  const lastDoubleTapTimeRef = useRef<number>()
  const lastShiftRef = useRef<PositionTypeSimplified | null>()
  const lastTouchDistanceRef = useRef<number | null>()
  const lastCursorRef = useRef<PositionType | null>()
  const lastTouchRef = useRef<PositionType | null>()

  // State
  const [zoom, setZoom] = useState(initialZoom)
  const [cursor, setCursor] = useState<CursorType>(DEFAULT_STATE.cursor)
  const [transitionDuration, setTransitionDuration] = useState(props.animDuration)
  const [posX, setPosX] = useState(DEFAULT_STATE.posX)
  const [posY, setPosY] = useState(DEFAULT_STATE.posY)

  useEffect(() => {
    onZoomChange?.(zoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  useEffect(() => {
    onPanChange?.({ posX, posY })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posX, posY])

  // Imperative Ref methods
  useImperativeHandle(forwardedRef, () => ({
    getZoom,
    zoomIn,
    reset,
    zoomOut,
    zoomToZone,
  }))

  // Methods
  const getZoom = () => zoom

  const zoomIn = (value: number) => {
    let newPosX = posX
    let newPosY = posY

    const prevZoom = zoom

    const newZoom = zoom + value < maxZoom ? zoom + value : maxZoom

    if (newZoom !== prevZoom) {
      newPosX = (newPosX * (newZoom - 1)) / (prevZoom > 1 ? prevZoom - 1 : prevZoom)
      newPosY = (newPosY * (newZoom - 1)) / (prevZoom > 1 ? prevZoom - 1 : prevZoom)
    }

    setZoom(newZoom)
    setPosX(newPosX)
    setPosY(newPosY)
    setTransitionDuration(animDuration)
  }

  const zoomOut = (value: number) => {
    let newPosX = posX
    let newPosY = posY

    const prevZoom = zoom

    const newZoom = zoom - value > minZoom ? zoom - value : minZoom

    if (newZoom !== prevZoom) {
      newPosX = (newPosX * (newZoom - 1)) / (prevZoom - 1)
      newPosY = (newPosY * (newZoom - 1)) / (prevZoom - 1)
    }

    setZoom(newZoom)
    setPosX(newPosX)
    setPosY(newPosY)
    setTransitionDuration(animDuration)
  }

  const zoomToZone = (relX: number, relY: number, relWidth: number, relHeight: number) => {
    if (!ref.current) return

    let newPosX = posX
    let newPosY = posY
    const parentRect = (ref.current?.parentNode as HTMLElement).getBoundingClientRect()

    const prevZoom = zoom

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
    setPosX(newPosX)
    setPosY(newPosY)
    setTransitionDuration(animDuration)
  }

  const getNewPosition = useCallback(
    (x: number, y: number, newZoom: number) => {
      const [prevZoom, prevPosX, prevPosY] = [zoom, posX, posY]

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
    },
    [posX, posY, zoom]
  )

  const fullZoomInOnPosition = useCallback(
    (x: number, y: number) => {
      const zoom = maxZoom
      const [posX, posY] = getNewPosition(x, y, zoom)

      setZoom(zoom)
      setPosX(posX)
      setPosY(posY)
      setTransitionDuration(animDuration)
    },
    [animDuration, getNewPosition, maxZoom]
  )

  const move = useCallback(
    (shiftX: number, shiftY: number, transitionDuration = 0) => {
      if (!ref.current) return
      let newPosX = posX
      let newPosY = posY

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

      setPosX(newPosX)
      setPosY(newPosY)
      setCursor(cursor)
      setTransitionDuration(transitionDuration)
    },
    [posX, posY]
  )

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

  const getLimitedShift = (
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
  }

  const getCursor = (canMoveOnX: boolean, canMoveOnY: boolean) => {
    if (canMoveOnX && canMoveOnY) {
      return 'move'
    } else if (canMoveOnX) {
      return 'ew-resize'
    } else if (canMoveOnY) {
      return 'ns-resize'
    } else {
      return 'auto'
    }
  }

  const startDeceleration = useCallback(
    (lastShiftOnX: number, lastShiftOnY: number) => {
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
    },
    [decelerationDuration, move]
  )

  const reset = useCallback(() => {
    setZoom(initialZoom)
    setCursor(DEFAULT_STATE.cursor)
    setTransitionDuration(animDuration)
    setPosX(DEFAULT_STATE.posX)
    setPosY(DEFAULT_STATE.posY)
  }, [animDuration, initialZoom])

  // Handlers
  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!allowZoom) return

    if (zoom === minZoom) {
      fullZoomInOnPosition(event.pageX, event.pageY)
    } else {
      reset()
    }
  }

  const handleMouseWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      if (!allowZoom) return

      // Use the scroll event delta to determine the zoom velocity
      const velocity = (-event.deltaY * scrollVelocity) / 100

      // Set the new zoom level
      const newZoom = Math.max(Math.min(zoom + velocity, maxZoom), minZoom)

      let position: number[] = [posX, posY]

      if (newZoom !== zoom) {
        position =
          newZoom !== minZoom
            ? getNewPosition(event.pageX, event.pageY, newZoom)
            : [DEFAULT_STATE.posX, DEFAULT_STATE.posY]
      }

      setZoom(newZoom)
      setTransitionDuration(0.05)
      const [newPosX, newPosY] = position
      setPosX(newPosX)
      setPosY(newPosY)
    },
    [allowZoom, getNewPosition, maxZoom, minZoom, posX, posY, scrollVelocity, zoom]
  )

  const handleMouseStart = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()
      if (!allowPan) return

      if (lastRequestAnimationIdRef.current) cancelAnimationFrame(lastRequestAnimationIdRef.current)
      lastCursorRef.current = { posX: event.pageX, posY: event.pageY }
    },
    [allowPan]
  )

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()

      if (!allowPan || !lastCursorRef.current) return

      const [posX, posY] = [event.pageX, event.pageY]
      const shiftX = posX - lastCursorRef.current.posX
      const shiftY = posY - lastCursorRef.current.posY

      move(shiftX, shiftY, 0)

      lastCursorRef.current = { posX, posY }
      lastShiftRef.current = { x: shiftX, y: shiftY }
    },
    [allowPan, move]
  )

  const handleMouseStop = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()

      if (lastShiftRef.current) {
        // Use the last shift to make a decelerating movement effect
        startDeceleration(lastShiftRef.current.x, lastShiftRef.current.y)
        lastShiftRef.current = null
      }

      lastCursorRef.current = null
      setCursor('auto')
    },
    [startDeceleration]
  )

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      const isThisDoubleTapping = isDoubleTapping()
      const isMultiTouch = event.touches.length > 1

      if (!allowTouchEvents) event.preventDefault()

      if (lastRequestAnimationIdRef.current) cancelAnimationFrame(lastRequestAnimationIdRef.current)

      const [posX, posY] = [event.touches[0].pageX, event.touches[0].pageY]

      if (isMultiTouch) {
        lastTouchRef.current = { posX, posY }
        return
      }

      if (isThisDoubleTapping && allowZoom) {
        if (zoom === minZoom) {
          fullZoomInOnPosition(posX, posY)
        } else {
          reset()
        }

        return
      }

      // Don't save the last touch if we are starting a simple touch move while panning is disabled
      if (allowPan) lastTouchRef.current = { posX, posY }
    },
    [allowPan, allowTouchEvents, allowZoom, fullZoomInOnPosition, isDoubleTapping, minZoom, reset, zoom]
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!allowTouchEvents) event.preventDefault()
      if (!lastTouchRef.current) return

      if (event.touches.length === 1) {
        const [posX, posY] = [event.touches[0].pageX, event.touches[0].pageY]
        // If we detect only one point, we shall just move the element
        const shiftX = posX - lastTouchRef.current.posX
        const shiftY = posY - lastTouchRef.current.posY

        move(shiftX, shiftY)
        lastShiftRef.current = { x: shiftX, y: shiftY }

        // Save data for the next move
        lastTouchRef.current = { posX, posY }
        lastTouchDistanceRef.current = null
      } else if (event.touches.length > 1) {
        let newZoom = zoom
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
          const [posX, posY] = getNewPosition(centerX, centerY, newZoom)

          setZoom(newZoom)
          setPosX(posX)
          setPosY(posY)
          setTransitionDuration(0)
        }

        // Save data for the next move
        lastTouchRef.current = { posX: pos1X, posY: pos1Y }
        lastTouchDistanceRef.current = distance
      }
    },
    [allowTouchEvents, allowZoom, getNewPosition, lastTouchRef, maxZoom, minZoom, move, zoom]
  )

  const handleTouchStop = useCallback(() => {
    if (lastShiftRef.current) {
      // Use the last shift to make a decelerating movement effect
      startDeceleration(lastShiftRef.current.x, lastShiftRef.current.y)
      lastShiftRef.current = null
    }

    lastTouchRef.current = null
    lastTouchDistanceRef.current = null
  }, [startDeceleration])

  // Effects
  useEffect(() => {
    const refCurrentValue = ref.current

    refCurrentValue?.addEventListener('wheel', handleMouseWheel, { passive: false })
    if (HAS_MOUSE_DEVICE) {
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
      if (HAS_MOUSE_DEVICE) {
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
    handleMouseMove,
    handleMouseStart,
    handleMouseStop,
    handleMouseWheel,
    handleTouchMove,
    handleTouchStart,
    handleTouchStop,
  ])

  const attr = {
    ...divProps,
    ref,
    onDoubleClick: handleDoubleClick,
    style: {
      ...divProps.style,
      cursor: cursor,
      willChange: 'transform',
      transition: `transform ease-out ${transitionDuration}s`,
      touchAction: allowParentPanning && zoom === 1 ? 'pan-x pan-y' : 'none',
      transform: `translate3d(${posX}px, ${posY}px, 0) scale(${zoom})`,
    },
  }

  return <div {...attr}>{children}</div>
})

export default PrismaZoom
