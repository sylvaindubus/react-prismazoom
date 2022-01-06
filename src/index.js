import React, { PureComponent, createRef } from 'react'
import PropTypes from 'prop-types'

export default class PrismaZoom extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    scrollVelocity: PropTypes.number,
    onZoomChange: PropTypes.func,
    onPanChange: PropTypes.func,
    animDuration: PropTypes.number,
    doubleTouchMaxDelay: PropTypes.number,
    decelerationDuration: PropTypes.number,
    locked: PropTypes.bool,
    allowTouchEvents: PropTypes.bool,
  }

  static defaultProps = {
    // Class name to apply on the zoom wrapper
    className: null,
    // Style to apply on the zoom wrapper
    style: {},
    // Minimum zoom ratio
    minZoom: 1,
    // Maximum zoom ratio
    maxZoom: 5,
    // Zoom increment or decrement on each scroll wheel detection
    scrollVelocity: 0.2,
    // Function called each time the zoom value changes
    onZoomChange: null,
    // Function called each time the posX or posY value changes (aka images was panned)
    onPanChange: null,
    // Animation duration (in seconds)
    animDuration: 0.25,
    // Max delay between two taps to consider a double tap (in milliseconds)
    doubleTouchMaxDelay: 300,
    // Decelerating movement duration after a mouse up or a touch end event (in milliseconds)
    decelerationDuration: 750,
    // Disable all user's interactions
    locked: false,
    // By default, all touch events are caught (if set to true touch events propagate)
    allowTouchEvents: false,
  }

  static defaultState = {
    // Transform scale value property
    zoom: 1,
    // Transform translateX value property
    posX: 0,
    // Transform translateY value property
    posY: 0,
    // Cursor style property
    cursor: 'auto',
  }

  constructor(props) {
    super(props)
    // Reference to the main element
    this.ref = createRef()
    // Last cursor position
    this.lastCursor = null
    // Last touch position
    this.lastTouch = null
    // Last touch time in milliseconds
    this.lastTouchTime = 0
    // Last double tap time (used to limit multiple double tap) in milliseconds
    this.lastDoubleTapTime = 0
    // Last calculated distance between two fingers in pixels
    this.lastTouchDistance = null
    // Last request animation frame identifier
    this.lastRequestAnimationId = null
    // Determines if the device has a mouse
    this.hasMouseDevice = window.matchMedia('(pointer: fine)').matches

    this.state = {
      ...this.constructor.defaultState,
      transitionDuration: props.animDuration,
    }
  }

  /**
   * Calculates new translate positions for CSS transformations.
   * @param  {Number} x     Relative (rect-based) X position in pixels
   * @param  {Number} y     Relative (rect-based) Y position in pixels
   * @param  {Number} zoom  Scale value
   * @return {Array}        New X and Y positions
   */
  getNewPosition = (x, y, zoom) => {
    const [prevZoom, prevPosX, prevPosY] = [this.state.zoom, this.state.posX, this.state.posY]

    if (zoom === 1) {
      return [0, 0]
    }

    if (zoom > prevZoom) {
      // Get container coordinates
      const rect = this.ref.current.getBoundingClientRect()

      // Retrieve rectangle dimensions and mouse position
      const [centerX, centerY] = [rect.width / 2, rect.height / 2]
      const [relativeX, relativeY] = [x - rect.left - window.pageXOffset, y - rect.top - window.pageYOffset]

      // If we are zooming down, we must try to center to mouse position
      const [absX, absY] = [(centerX - relativeX) / prevZoom, (centerY - relativeY) / prevZoom]
      const ratio = zoom - prevZoom
      return [prevPosX + absX * ratio, prevPosY + absY * ratio]
    } else {
      // If we are zooming down, we shall re-center the element
      return [(prevPosX * (zoom - 1)) / (prevZoom - 1), (prevPosY * (zoom - 1)) / (prevZoom - 1)]
    }
  }

  /**
   * Calculates the narrowed shift for panning actions.
   * @param  {Number} shift      Initial shift in pixels
   * @param  {Number} minLimit   Minimum limit (left or top) in pixels
   * @param  {Number} maxLimit   Maximum limit (right or bottom) in pixels
   * @param  {Number} minElement Left or top element position in pixels
   * @param  {Number} maxElement Right or bottom element position in pixels
   * @return {Number}            Narrowed shift
   */
  getLimitedShift = (shift, minLimit, maxLimit, minElement, maxElement) => {
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

  /**
   * Determines cursor style.
   * @param  {Boolean} canMoveOnX Element can be panned on the X axis
   * @param  {Boolean} canMoveOnY Element can be panned on the Y axis
   * @return {String}             Cursor style
   */
  getCursor = (canMoveOnX, canMoveOnY) => {
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

  /**
   * Applies a full-zoom on the specified X and Y positions
   * @param  {Number} x Relative (rect-based) X position in pixels
   * @param  {Number} y Relative (rect-based) Y position in pixels
   */
  fullZoomInOnPosition = (x, y) => {
    const { maxZoom } = this.props

    const zoom = maxZoom
    const [posX, posY] = this.getNewPosition(x, y, zoom)

    this.setState({ zoom, posX, posY, transitionDuration: this.props.animDuration })
  }

  /**
   * Moves the element by incrementing its position with given X and Y values.
   * @param  {Number} shiftX             Position change to apply on X axis in pixels
   * @param  {Number} shiftY             Position change to apply on Y axis in pixels
   * @param  {Number} transitionDuration Transition duration (in seconds)
   */
  move = (shiftX, shiftY, transitionDuration = 0) => {
    if (!this.ref.current) return
    let { posX, posY } = this.state

    // Get container and container's parent coordinates
    const rect = this.ref.current.getBoundingClientRect()
    const parentRect = this.ref.current.parentNode.getBoundingClientRect()

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
      posX += this.getLimitedShift(shiftX, parentRect.left, parentRect.right, rect.left, rect.right)
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
      posY += this.getLimitedShift(shiftY, parentRect.top, parentRect.bottom, rect.top, rect.bottom)
    }

    const cursor = this.getCursor(canMoveOnX, canMoveOnY)

    this.setState({ posX, posY, cursor, transitionDuration })
  }

  /**
   * Trigger a decelerating movement after a mouse up or a touch end event, using the last movement shift.
   * @param  {Number} lastShiftOnX Last shift on the X axis in pixels
   * @param  {Number} lastShiftOnY Last shift on the Y axis in pixels
   */
  startDeceleration = (lastShiftOnX, lastShiftOnY) => {
    let startTimestamp = null

    const move = (timestamp) => {
      if (startTimestamp === null) {
        startTimestamp = timestamp
      }
      const progress = timestamp - startTimestamp

      // Calculates the ratio to apply on the move (used to create a non-linear deceleration)
      const ratio = (this.props.decelerationDuration - progress) / this.props.decelerationDuration

      const [shiftX, shiftY] = [lastShiftOnX * ratio, lastShiftOnY * ratio]

      // Continue animation only if time has not expired and if there is still some movement (more than 1 pixel on one axis)
      if (progress < this.props.decelerationDuration && Math.max(Math.abs(shiftX), Math.abs(shiftY)) > 1) {
        this.move(shiftX, shiftY, 0)
        this.lastRequestAnimationId = requestAnimationFrame(move)
      } else {
        this.lastRequestAnimationId = null
      }
    }

    this.lastRequestAnimationId = requestAnimationFrame(move)
  }

  /**
   * Event handler on scroll.
   * @param  {MouseEvent} event Mouse event
   */
  handleMouseWheel = (event) => {
    event.preventDefault()
    if (this.props.locked) {
      return
    }

    const { minZoom, maxZoom, scrollVelocity } = this.props
    let { zoom, posX, posY } = this.state

    // Use the scroll event delta to determine the zoom velocity
    const velocity = (-event.deltaY * scrollVelocity) / 100

    // Set the new zoom level
    zoom = Math.max(Math.min(zoom + velocity, maxZoom), minZoom)

    if (zoom !== this.state.zoom) {
      if (zoom !== minZoom) {
        ;[posX, posY] = this.getNewPosition(event.pageX, event.pageY, zoom)
      } else {
        // Reset to original position
        ;[posX, posY] = [this.constructor.defaultState.posX, this.constructor.defaultState.posY]
      }
    }

    this.setState({ zoom, posX, posY, transitionDuration: 0.05 })
  }

  /**
   * Event handler on double click.
   * @param  {MouseEvent} event Mouse event
   */
  handleDoubleClick = (event) => {
    event.preventDefault()
    if (this.props.locked) {
      return
    }

    if (this.state.zoom === this.props.minZoom) {
      this.fullZoomInOnPosition(event.pageX, event.pageY)
    } else {
      this.reset()
    }
  }

  /**
   * Event handler on mouse down.
   * @param  {MouseEvent} event Mouse event
   */
  handleMouseStart = (event) => {
    event.preventDefault()
    if (this.props.locked) {
      return
    }

    if (this.lastRequestAnimationId) {
      cancelAnimationFrame(this.lastRequestAnimationId)
    }

    this.lastCursor = { posX: event.pageX, posY: event.pageY }
  }

  /**
   * Event handler on mouse move.
   * @param  {MouseEvent} event Mouse event
   */
  handleMouseMove = (event) => {
    event.preventDefault()
    if (this.props.locked || !this.lastCursor) {
      return
    }

    const [posX, posY] = [event.pageX, event.pageY]
    const shiftX = posX - this.lastCursor.posX
    const shiftY = posY - this.lastCursor.posY

    this.move(shiftX, shiftY, 0)
    this.lastCursor = { posX, posY }
    this.lastShift = { x: shiftX, y: shiftY }
  }

  /**
   * Event handler on mouse up or mouse out.
   * @param  {MouseEvent} event Mouse event
   */
  handleMouseStop = (event) => {
    event.preventDefault()

    if (this.lastShift) {
      // Use the last shift to make a decelerating movement effect
      this.startDeceleration(this.lastShift.x, this.lastShift.y)
      this.lastShift = null
    }

    this.lastCursor = null
    this.setState({ cursor: 'auto' })
  }

  /**
   * Event handler on touch start.
   * Zoom-in at the maximum scale if a double tap is detected.
   * @param  {TouchEvent} event Touch event
   */
  handleTouchStart = (event) => {
    if (!this.props.allowTouchEvents) {
      event.preventDefault()
    }

    if (this.props.locked) return

    if (this.lastRequestAnimationId) {
      cancelAnimationFrame(this.lastRequestAnimationId)
    }

    const [posX, posY] = [event.touches[0].pageX, event.touches[0].pageY]

    if (event.touches.length === 1) {
      // Check if it is a double tap
      const touchTime = new Date().getTime()
      if (
        touchTime - this.lastTouchTime < this.props.doubleTouchMaxDelay &&
        touchTime - this.lastDoubleTapTime > this.props.doubleTouchMaxDelay
      ) {
        if (this.state.zoom === this.props.minZoom) {
          this.fullZoomInOnPosition(posX, posY)
        } else {
          this.reset()
        }
        this.lastDoubleTapTime = touchTime
      }

      this.lastTouchTime = touchTime
    }

    this.lastTouch = { posX, posY }
  }

  /**
   * Event handler on touch move.
   * Either move the element using one finger or zoom-in with a two finger pinch.
   * @param  {TouchEvent} event Touch move
   */
  handleTouchMove = (event) => {
    if (!this.props.allowTouchEvents) {
      event.preventDefault()
    }

    if (this.props.locked || !this.lastTouch) return

    const { maxZoom, minZoom } = this.props
    let { zoom } = this.state

    if (event.touches.length === 1) {
      const [posX, posY] = [event.touches[0].pageX, event.touches[0].pageY]
      // If we detect only one point, we shall just move the element
      const shiftX = posX - this.lastTouch.posX
      const shiftY = posY - this.lastTouch.posY

      this.move(shiftX, shiftY)
      this.lastShift = { x: shiftX, y: shiftY }

      // Save data for the next move
      this.lastTouch = { posX, posY }
      this.lastTouchDistance = null
    } else if (event.touches.length > 1) {
      // If we detect two points, we shall zoom up or down
      const [pos1X, pos1Y] = [event.touches[0].pageX, event.touches[0].pageY]
      const [pos2X, pos2Y] = [event.touches[1].pageX, event.touches[1].pageY]
      const distance = Math.sqrt(Math.pow(pos2X - pos1X, 2) + Math.pow(pos2Y - pos1Y, 2))

      if (this.lastTouchDistance && distance && distance !== this.lastTouchDistance) {
        zoom += (distance - this.lastTouchDistance) / 100
        if (zoom > maxZoom) {
          zoom = maxZoom
        } else if (zoom < minZoom) {
          zoom = minZoom
        }

        // Change position using the center point between the two fingers
        const [centerX, centerY] = [(pos1X + pos2X) / 2, (pos1Y + pos2Y) / 2]
        const [posX, posY] = this.getNewPosition(centerX, centerY, zoom)

        this.setState({ zoom, posX, posY, transitionDuration: 0 })
      }

      // Save data for the next move
      this.lastTouch = { posX: pos1X, posY: pos1Y }
      this.lastTouchDistance = distance
    }
  }

  /**
   * Event handler on touch end or touch cancel.
   * @param  {TouchEvent} event Touch move
   */
  handleTouchStop = () => {
    if (this.lastShift) {
      // Use the last shift to make a decelerating movement effect
      this.startDeceleration(this.lastShift.x, this.lastShift.y)
      this.lastShift = null
    }

    this.lastTouch = null
    this.lastTouchDistance = null
  }

  /**
   * Increments the zoom with the given value.
   * @param  {Number} value Zoom value
   */
  zoomIn = (value) => {
    const { maxZoom } = this.props
    let { zoom, posX, posY } = this.state

    const prevZoom = zoom

    zoom = zoom + value < maxZoom ? zoom + value : maxZoom

    if (zoom !== prevZoom) {
      posX = (posX * (zoom - 1)) / (prevZoom > 1 ? prevZoom - 1 : prevZoom)
      posY = (posY * (zoom - 1)) / (prevZoom > 1 ? prevZoom - 1 : prevZoom)
    }

    this.setState({ zoom, posX, posY, transitionDuration: this.props.animDuration })
  }

  /**
   * Decrements the zoom with the given value.
   * @param  {Number} value Zoom value
   */
  zoomOut = (value) => {
    const { minZoom } = this.props
    let { zoom, posX, posY } = this.state

    const prevZoom = zoom

    zoom = zoom - value > minZoom ? zoom - value : minZoom

    if (zoom !== prevZoom) {
      posX = (posX * (zoom - 1)) / (prevZoom - 1)
      posY = (posY * (zoom - 1)) / (prevZoom - 1)
    }

    this.setState({ zoom, posX, posY, transitionDuration: this.props.animDuration })
  }

  /**
   * Zoom-in on the specified zone with the given relative coordinates and dimensions.
   * @param  {Number} relX      Relative X position of the zone left-top corner in pixels
   * @param  {Number} relY      Relative Y position of the zone left-top corner in pixels
   * @param  {Number} relWidth  Zone width in pixels
   * @param  {Number} relHeight Zone height in pixels
   */
  zoomToZone = (relX, relY, relWidth, relHeight) => {
    const { maxZoom } = this.props
    let { zoom, posX, posY } = this.state
    const parentRect = this.ref.current.parentNode.getBoundingClientRect()

    const prevZoom = zoom

    // Calculate zoom factor to scale the zone
    const optimalZoomX = parentRect.width / relWidth
    const optimalZoomY = parentRect.height / relHeight
    zoom = Math.min(optimalZoomX, optimalZoomY, maxZoom)

    // Calculate new position to center the zone
    const rect = this.ref.current.getBoundingClientRect()
    const [centerX, centerY] = [rect.width / prevZoom / 2, rect.height / prevZoom / 2]
    const [zoneCenterX, zoneCenterY] = [relX + relWidth / 2, relY + relHeight / 2]
    posX = (centerX - zoneCenterX) * zoom
    posY = (centerY - zoneCenterY) * zoom

    this.setState({ zoom, posX, posY, transitionDuration: this.props.animDuration })
  }

  /**
   * Resets the component to its initial state.
   */
  reset = () => {
    this.setState({
      ...this.constructor.defaultState,
      transitionDuration: this.props.animDuration,
    })
  }

  /**
   * Returns the current zoom value.
   * @return {Number} Zoom value
   */
  getZoom = () => {
    return this.state.zoom
  }

  componentDidUpdate(_, prevState) {
    if (this.props.onZoomChange && this.state.zoom !== prevState.zoom) {
      this.props.onZoomChange(this.state.zoom)
    }
    if (this.props.onPanChange && (this.state.posX !== prevState.posX || this.state.posY !== prevState.posY)) {
      this.props.onPanChange({ posX: this.state.posX, posY: this.state.posY })
    }
  }

  componentDidMount() {
    this.ref.current.addEventListener('wheel', this.handleMouseWheel.bind(this), { passive: false })

    if (this.hasMouseDevice) {
      // Apply mouse events only to devices which include an accurate pointing device
      this.ref.current.addEventListener('mousedown', this.handleMouseStart.bind(this), { passive: false })
      this.ref.current.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: false })
      this.ref.current.addEventListener('mouseup', this.handleMouseStop.bind(this), { passive: false })
      this.ref.current.addEventListener('mouseleave', this.handleMouseStop.bind(this), { passive: false })
    } else {
      // Apply touch events to all other devices
      this.ref.current.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
      this.ref.current.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
      this.ref.current.addEventListener('touchend', this.handleTouchStop.bind(this), { passive: false })
      this.ref.current.addEventListener('touchcancel', this.handleTouchStop.bind(this), { passive: false })
    }
  }

  componentWillUnmount() {
    this.ref.current.removeEventListener('wheel', this.handleMouseWheel.bind(this))

    if (this.hasMouseDevice) {
      this.ref.current.removeEventListener('mousedown', this.handleMouseStart.bind(this))
      this.ref.current.removeEventListener('mousemove', this.handleMouseMove.bind(this))
      this.ref.current.removeEventListener('mouseup', this.handleMouseStop.bind(this))
      this.ref.current.removeEventListener('mouseleave', this.handleMouseStop.bind(this))
    } else {
      this.ref.current.removeEventListener('touchstart', this.handleTouchStart.bind(this))
      this.ref.current.removeEventListener('touchmove', this.handleTouchMove.bind(this))
      this.ref.current.removeEventListener('touchend', this.handleTouchStop.bind(this))
      this.ref.current.removeEventListener('touchcancel', this.handleTouchStop.bind(this))
    }
  }

  render() {
    const { className, style, children } = this.props
    const { zoom, posX, posY, cursor, transitionDuration } = this.state

    const attr = {
      ref: this.ref,
      onDoubleClick: this.handleDoubleClick.bind(this),
      className,
      style: {
        ...style,
        transform: `translate3d(${posX}px, ${posY}px, 0) scale(${zoom})`,
        transition: `transform ease-out ${transitionDuration}s`,
        cursor: cursor,
        touchAction: 'none',
        willChange: 'transform',
      },
    }

    return <div {...attr}>{children}</div>
  }
}
