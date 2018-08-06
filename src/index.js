import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

const doubleTouchMaxDelay = 300

export default class PrismaZoom extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    scrollVelocity: PropTypes.number,
    onZoomChange: PropTypes.func,
    leftBoundary: PropTypes.number,
    rightBoundary: PropTypes.number,
    topBoundary: PropTypes.number,
    bottomBoundary: PropTypes.number
  }

  static defaultProps = {
    minZoom: 1,
    maxZoom: 5,
    scrollVelocity: 0.1,
    onZoomChange: null,
    leftBoundary: 0,
    rightBoundary: 0,
    topBoundary: 0,
    bottomBoundary: 0
  }

  static defaultState = {
    zoom: 1,
    posX: 0,
    posY: 0,
    cursor: 'auto',
    useTransition: true
  }

  constructor (props) {
    super(props)
    this.lastCursor = null
    this.lastTouch = null
    this.lastTouchTime = 0
    this.lastDoubleTapTime = 0
    this.lastTouchDistance = null
    this.state = {...this.constructor.defaultState}
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.onZoomChange && this.state.zoom !== prevState.zoom) {
      this.props.onZoomChange(this.state.zoom)
    }
  }

  getNewPosition = (rect, x, y, zoom) => {
    const [prevZoom, prevPosX, prevPosY] = [this.state.zoom, this.state.posX, this.state.posY]

    if (zoom === 1) {
      return [0, 0]
    }

    if (zoom > prevZoom) {
      // Retrieve rectangle dimensions and mouse position
      const [centerX, centerY] = [rect.width / 2, rect.height / 2]
      const [relativeX, relativeY] = [x - rect.left, y - rect.top]

      // If we are zooming down, we must try to center to mouse position
      const [absX, absY] = [(centerX - relativeX) / prevZoom, (centerY - relativeY) / prevZoom]
      const ratio = zoom - prevZoom
      return [
        prevPosX + (absX * ratio),
        prevPosY + (absY * ratio)
      ]
    } else {
      // If we are zooming down, we shall re-center the element
      return [
        (prevPosX * (zoom - 1)) / (prevZoom - 1),
        (prevPosY * (zoom - 1)) / (prevZoom - 1)
      ]
    }
  }

  getLimitedShift (shift, minLimit, maxLimit, minElement, maxElement) {
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

  fullZoomOnPointer = (rect, x, y) => {
    const { minZoom, maxZoom } = this.props
    let { zoom, posX, posY } = this.state

    // Set the new zoom value
    zoom = (zoom === minZoom ? maxZoom : minZoom)

    if (zoom === maxZoom) {
      [ posX, posY ] = this.getNewPosition(rect, x, y, zoom)
    } else {
      // Reset to original position
      [ posX, posY ] = [this.constructor.defaultState.posX, this.constructor.defaultState.posY]
    }

    this.setState({ zoom, posX, posY, useTransition: true })
  }

  move = (rect, shiftX, shiftY) => {
    const { leftBoundary, rightBoundary, topBoundary, bottomBoundary } = this.props
    let { posX, posY } = this.state

    // Get horizontal limits using specified horizontal boundaries
    const [leftLimit, rightLimit] = [
      leftBoundary,
      document.body.clientWidth - rightBoundary
    ]

    let canMoveOnX = false
    // Check if the element is larger than the layout zone
    if (rect.width > (rightLimit - leftLimit)) {
      // If the element is bigger than its container, allow moves
      canMoveOnX = true
      // Limit the shift considering boudaries
      posX += this.getLimitedShift(shiftX, leftLimit, rightLimit, rect.left, rect.right)
    } else if ((posX > 0 && shiftX < 0) || (posX < 0 && shiftX > 0)) {
      // If the element is smaller than its container, allow only centering moves
      canMoveOnX = true
      if (Math.abs(posX) > 5) {
        posX += shiftX
      } else {
        posX = 0
      }
    }

    // Get vertical limits using specified vertical boundaries
    const [topLimit, bottomLimit] = [
      topBoundary,
      document.body.clientHeight - bottomBoundary
    ]

    let canMoveOnY = false
    // Check if the element is higher than the layout zone
    if (rect.height > (bottomLimit - topLimit)) {
      // If the element is bigger than its container, allow moves
      canMoveOnY = true
      // Limit the shift considering boudaries
      posY += this.getLimitedShift(shiftY, topLimit, bottomLimit, rect.top, rect.bottom)
    } else if ((posY > 0 && shiftY < 0) || (posY < 0 && shiftY > 0)) {
      // If the element is smaller than its container, allow only centering moves
      canMoveOnY = true
      if (Math.abs(posY) > 5) {
        posY += shiftY
      } else {
        posY = 0
      }
    }

    const cursor = this.getCursor(canMoveOnX, canMoveOnY)

    this.setState({ posX, posY, cursor, useTransition: false })
  }

  handleMouseWheel = event => {
    event.preventDefault()
    const { minZoom, maxZoom, scrollVelocity } = this.props
    let { zoom, posX, posY } = this.state

    // Keep the previous zoom value
    const prevZoom = zoom

    // Determine if we are increasing or decreasing the zoom
    const increaseZoom = event.deltaY < 0

    // Set the new zoom value
    if (increaseZoom) {
      zoom = (zoom + scrollVelocity < maxZoom ? zoom + scrollVelocity : maxZoom)
    } else {
      zoom = (zoom - scrollVelocity > minZoom ? zoom - scrollVelocity : minZoom)
    }

    if (zoom !== prevZoom) {
      const rect = event.currentTarget.getBoundingClientRect()
      if (zoom !== minZoom) {
        [ posX, posY ] = this.getNewPosition(rect, event.pageX, event.pageY, zoom)
      } else {
        // Reset to original position
        [ posX, posY ] = [this.constructor.defaultState.posX, this.constructor.defaultState.posY]
      }
    }

    this.setState({ zoom, posX, posY, useTransition: false })
  }

  handleDoubleClick = event => {
    event.preventDefault()

    const rect = event.currentTarget.getBoundingClientRect()
    this.fullZoomOnPointer(rect, event.pageX, event.pageY)
  }

  handleMouseStart = event => {
    event.preventDefault()

    this.lastCursor = { posX: event.pageX, posY: event.pageY }
  }

  handleMouseMove = event => {
    event.preventDefault()

    if (!this.lastCursor) {
      return
    }

    const [posX, posY] = [event.pageX, event.pageY]
    const rect = event.currentTarget.getBoundingClientRect()
    const shiftX = posX - this.lastCursor.posX
    const shiftY = posY - this.lastCursor.posY

    this.move(rect, shiftX, shiftY)
    this.lastCursor = { posX, posY }
  }

  handleMouseStop = event => {
    event.preventDefault()

    this.lastCursor = null
    this.setState({ cursor: 'auto' })
  }

  handleTouchStart = event => {
    event.preventDefault()

    const [posX, posY] = [event.touches[0].pageX, event.touches[0].pageY]

    if (event.touches.length === 1) {
      // Check if it is a double tap
      const touchTime = new Date().getTime()
      if (touchTime - this.lastTouchTime < doubleTouchMaxDelay && touchTime - this.lastDoubleTapTime > doubleTouchMaxDelay) {
        const rect = event.currentTarget.getBoundingClientRect()
        this.fullZoomOnPointer(rect, posX, posY)
        this.lastDoubleTapTime = touchTime
      }

      this.lastTouchTime = touchTime
    }

    this.lastTouch = { posX, posY }
  }

  handleTouchMove = event => {
    event.preventDefault()
    const { maxZoom, minZoom } = this.props
    let { zoom } = this.state

    if (!this.lastTouch) {
      return
    }

    if (event.touches.length === 1) {
      const [posX, posY] = [event.touches[0].pageX, event.touches[0].pageY]
      // If we detect only one point, we shall just move the element
      const rect = event.currentTarget.getBoundingClientRect()
      const shiftX = posX - this.lastTouch.posX
      const shiftY = posY - this.lastTouch.posY

      this.move(rect, shiftX, shiftY)

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
        const rect = event.currentTarget.getBoundingClientRect()
        const [centerX, centerY] = [(pos1X + pos2X) / 2, (pos1Y + pos2Y) / 2]
        const [posX, posY] = this.getNewPosition(rect, centerX, centerY, zoom)

        this.setState({ zoom, posX, posY, useTransition: false })
      }

      // Save data for the next move
      this.lastTouchDistance = distance
      this.lastTouch = { posX: pos1X, posY: pos1Y }
    }
  }

  handleTouchStop = event => {
    event.preventDefault()

    this.lastTouch = null
    this.lastTouchDistance = null
  }

  zoomUp = value => {
    const { maxZoom } = this.props
    let { zoom, posX, posY } = this.state

    const prevZoom = zoom

    zoom = (zoom + value < maxZoom ? zoom + value : maxZoom)

    if (zoom !== prevZoom) {
      posX = (posX * (zoom - 1)) / (prevZoom > 1 ? (prevZoom - 1) : prevZoom)
      posY = (posY * (zoom - 1)) / (prevZoom > 1 ? (prevZoom - 1) : prevZoom)
    }

    this.setState({ zoom, posX, posY, useTransition: true })
  }

  zoomDown = value => {
    const { minZoom } = this.props
    let { zoom, posX, posY } = this.state

    const prevZoom = zoom

    zoom = (zoom - value > minZoom ? zoom - value : minZoom)

    if (zoom !== prevZoom) {
      posX = (posX * (zoom - 1)) / (prevZoom - 1)
      posY = (posY * (zoom - 1)) / (prevZoom - 1)
    }

    this.setState({ zoom, posX, posY, useTransition: true })
  }

  zoomToZone = (relX, relY, relWidth, relHeight) => {
    const { maxZoom, leftBoundary, rightBoundary, topBoundary, bottomBoundary } = this.props
    let { zoom, posX, posY } = this.state

    const prevZoom = zoom

    // Calculate zoom factor to scale the zone
    const optimalZoomX = (document.body.clientWidth - leftBoundary - rightBoundary) / relWidth
    const optimalZoomY = (document.body.clientHeight - topBoundary - bottomBoundary) / relHeight
    zoom = Math.min(optimalZoomX, optimalZoomY, maxZoom)

    // Calculate new position to center the zone
    const rect = this.refs.layout.getBoundingClientRect()
    const [centerX, centerY] = [(rect.width / prevZoom) / 2, (rect.height / prevZoom) / 2]
    const [zoneCenterX, zoneCenterY] = [relX + (relWidth / 2), relY + (relHeight / 2)]
    posX = (centerX - zoneCenterX) * zoom
    posY = (centerY - zoneCenterY) * zoom

    this.setState({ zoom, posX, posY, useTransition: true })
  }

  reset = () => {
    this.setState(this.constructor.defaultState)
  }

  getZoom = () => {
    return this.state.zoom
  }

  render () {
    const { className, children } = this.props
    const { zoom, posX, posY, cursor, useTransition } = this.state

    const style = {
      ...this.props.style,
      transform: `translate(${posX}px, ${posY}px) scale(${zoom})`,
      transition: (useTransition ? 'transform ease-in-out 0.25s' : ''),
      cursor: cursor,
      touchAction: 'none'
    }

    const attr = {
      ref: 'layout',
      style: style,
      className: className,
      onWheel: this.handleMouseWheel,
      onDoubleClick: this.handleDoubleClick,
      onMouseDown: this.handleMouseStart,
      onMouseMove: this.handleMouseMove,
      onMouseUp: this.handleMouseStop,
      onMouseLeave: this.handleMouseStop,
      onTouchStart: this.handleTouchStart,
      onTouchMove: this.handleTouchMove,
      onTouchEnd: this.handleTouchStop,
      onTouchCancel: this.handleTouchStop
    }

    return <div {...attr}>{children}</div>
  }
}
