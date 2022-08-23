"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var PrismaZoom = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2.default)(PrismaZoom, _PureComponent);

  var _super = _createSuper(PrismaZoom);

  function PrismaZoom(props) {
    var _this;

    (0, _classCallCheck2.default)(this, PrismaZoom);
    _this = _super.call(this, props); // Reference to the main element

    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getNewPosition", function (x, y, zoom) {
      var _ref = [_this.state.zoom, _this.state.posX, _this.state.posY],
          prevZoom = _ref[0],
          prevPosX = _ref[1],
          prevPosY = _ref[2];

      if (zoom === 1) {
        return [0, 0];
      }

      if (zoom > prevZoom) {
        // Get container coordinates
        var rect = _this.ref.current.getBoundingClientRect(); // Retrieve rectangle dimensions and mouse position


        var centerX = rect.width / 2,
            centerY = rect.height / 2;
        var relativeX = x - rect.left - window.pageXOffset,
            relativeY = y - rect.top - window.pageYOffset; // If we are zooming down, we must try to center to mouse position

        var absX = (centerX - relativeX) / prevZoom,
            absY = (centerY - relativeY) / prevZoom;
        var ratio = zoom - prevZoom;
        return [prevPosX + absX * ratio, prevPosY + absY * ratio];
      } else {
        // If we are zooming down, we shall re-center the element
        return [prevPosX * (zoom - 1) / (prevZoom - 1), prevPosY * (zoom - 1) / (prevZoom - 1)];
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getLimitedShift", function (shift, minLimit, maxLimit, minElement, maxElement) {
      if (shift > 0) {
        if (minElement > minLimit) {
          // Forbid move if we are moving to left or top while we are already out minimum boudaries
          return 0;
        } else if (minElement + shift > minLimit) {
          // Lower the shift if we are going out boundaries
          return minLimit - minElement;
        }
      } else if (shift < 0) {
        if (maxElement < maxLimit) {
          // Forbid move if we are moving to right or bottom while we are already out maximum boudaries
          return 0;
        } else if (maxElement + shift < maxLimit) {
          // Lower the shift if we are going out boundaries
          return maxLimit - maxElement;
        }
      }

      return shift;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getCursor", function (canMoveOnX, canMoveOnY) {
      if (canMoveOnX && canMoveOnY) {
        return 'move';
      } else if (canMoveOnX) {
        return 'ew-resize';
      } else if (canMoveOnY) {
        return 'ns-resize';
      } else {
        return 'auto';
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "fullZoomInOnPosition", function (x, y) {
      var maxZoom = _this.props.maxZoom;
      var zoom = maxZoom;

      var _this$getNewPosition = _this.getNewPosition(x, y, zoom),
          _this$getNewPosition2 = (0, _slicedToArray2.default)(_this$getNewPosition, 2),
          posX = _this$getNewPosition2[0],
          posY = _this$getNewPosition2[1];

      _this.setState({
        zoom: zoom,
        posX: posX,
        posY: posY,
        transitionDuration: _this.props.animDuration
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "move", function (shiftX, shiftY) {
      var transitionDuration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      if (!_this.ref.current) return;
      var _this$state = _this.state,
          posX = _this$state.posX,
          posY = _this$state.posY; // Get container and container's parent coordinates

      var rect = _this.ref.current.getBoundingClientRect();

      var parentRect = _this.ref.current.parentNode.getBoundingClientRect();

      var isLarger = // Check if the element is larger than its container
      rect.width > parentRect.right - parentRect.left,
          isOutLeftBoundary = // Check if the element is out its container left boundary
      shiftX > 0 && rect.left - parentRect.left < 0,
          isOutRightBoundary = // Check if the element is out its container right boundary
      shiftX < 0 && rect.right - parentRect.right > 0;
      var canMoveOnX = isLarger || isOutLeftBoundary || isOutRightBoundary;

      if (canMoveOnX) {
        posX += _this.getLimitedShift(shiftX, parentRect.left, parentRect.right, rect.left, rect.right);
      }

      var isHigher = // Check if the element is higher than its container
      rect.height > parentRect.bottom - parentRect.top,
          isOutTopBoundary = // Check if the element is out its container top boundary
      shiftY > 0 && rect.top - parentRect.top < 0,
          isOutBottomBoundary = // Check if the element is out its container bottom boundary
      shiftY < 0 && rect.bottom - parentRect.bottom > 0;
      var canMoveOnY = isHigher || isOutTopBoundary || isOutBottomBoundary;

      if (canMoveOnY) {
        posY += _this.getLimitedShift(shiftY, parentRect.top, parentRect.bottom, rect.top, rect.bottom);
      }

      var cursor = _this.getCursor(canMoveOnX, canMoveOnY);

      _this.setState({
        posX: posX,
        posY: posY,
        cursor: cursor,
        transitionDuration: transitionDuration
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "startDeceleration", function (lastShiftOnX, lastShiftOnY) {
      var startTimestamp = null;

      var move = function move(timestamp) {
        if (startTimestamp === null) {
          startTimestamp = timestamp;
        }

        var progress = timestamp - startTimestamp; // Calculates the ratio to apply on the move (used to create a non-linear deceleration)

        var ratio = (_this.props.decelerationDuration - progress) / _this.props.decelerationDuration;
        var shiftX = lastShiftOnX * ratio,
            shiftY = lastShiftOnY * ratio; // Continue animation only if time has not expired and if there is still some movement (more than 1 pixel on one axis)

        if (progress < _this.props.decelerationDuration && Math.max(Math.abs(shiftX), Math.abs(shiftY)) > 1) {
          _this.move(shiftX, shiftY, 0);

          _this.lastRequestAnimationId = requestAnimationFrame(move);
        } else {
          _this.lastRequestAnimationId = null;
        }
      };

      _this.lastRequestAnimationId = requestAnimationFrame(move);
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "handleMouseWheel", function (event) {
      event.preventDefault();

      if (!_this.props.allowZoom) {
        return;
      }

      var _this$props = _this.props,
          minZoom = _this$props.minZoom,
          maxZoom = _this$props.maxZoom,
          scrollVelocity = _this$props.scrollVelocity;
      var _this$state2 = _this.state,
          zoom = _this$state2.zoom,
          posX = _this$state2.posX,
          posY = _this$state2.posY; // Use the scroll event delta to determine the zoom velocity

      var velocity = -event.deltaY * scrollVelocity / 100; // Set the new zoom level

      zoom = Math.max(Math.min(zoom + velocity, maxZoom), minZoom);

      if (zoom !== _this.state.zoom) {
        if (zoom !== minZoom) {
          ;

          var _this$getNewPosition3 = _this.getNewPosition(event.pageX, event.pageY, zoom);

          var _this$getNewPosition4 = (0, _slicedToArray2.default)(_this$getNewPosition3, 2);

          posX = _this$getNewPosition4[0];
          posY = _this$getNewPosition4[1];
        } else {
          // Reset to original position
          ;
          var _ref2 = [_this.constructor.defaultState.posX, _this.constructor.defaultState.posY];
          posX = _ref2[0];
          posY = _ref2[1];
        }
      }

      _this.setState({
        zoom: zoom,
        posX: posX,
        posY: posY,
        transitionDuration: 0.05
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "handleDoubleClick", function (event) {
      event.preventDefault();

      if (!_this.props.allowZoom) {
        return;
      }

      if (_this.state.zoom === _this.props.minZoom) {
        _this.fullZoomInOnPosition(event.pageX, event.pageY);
      } else {
        _this.reset();
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "handleMouseStart", function (event) {
      event.preventDefault();

      if (!_this.props.allowPan) {
        return;
      }

      if (_this.lastRequestAnimationId) {
        cancelAnimationFrame(_this.lastRequestAnimationId);
      }

      _this.lastCursor = {
        posX: event.pageX,
        posY: event.pageY
      };
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "handleMouseMove", function (event) {
      event.preventDefault();

      if (!_this.props.allowPan || !_this.lastCursor) {
        return;
      }

      var _ref3 = [event.pageX, event.pageY],
          posX = _ref3[0],
          posY = _ref3[1];
      var shiftX = posX - _this.lastCursor.posX;
      var shiftY = posY - _this.lastCursor.posY;

      _this.move(shiftX, shiftY, 0);

      _this.lastCursor = {
        posX: posX,
        posY: posY
      };
      _this.lastShift = {
        x: shiftX,
        y: shiftY
      };
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "handleMouseStop", function (event) {
      event.preventDefault();

      if (_this.lastShift) {
        // Use the last shift to make a decelerating movement effect
        _this.startDeceleration(_this.lastShift.x, _this.lastShift.y);

        _this.lastShift = null;
      }

      _this.lastCursor = null;

      _this.setState({
        cursor: 'auto'
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "handleTouchStart", function (event) {
      var _this$props2 = _this.props,
          allowTouchEvents = _this$props2.allowTouchEvents,
          allowZoom = _this$props2.allowZoom,
          allowPan = _this$props2.allowPan,
          minZoom = _this$props2.minZoom;

      var isDoubleTapping = _this.isDoubleTapping();

      var isMultiTouch = event.touches.length > 1;

      if (!allowTouchEvents) {
        event.preventDefault();
      }

      if (_this.lastRequestAnimationId) {
        cancelAnimationFrame(_this.lastRequestAnimationId);
      }

      var _ref4 = [event.touches[0].pageX, event.touches[0].pageY],
          posX = _ref4[0],
          posY = _ref4[1];

      if (isMultiTouch) {
        _this.lastTouch = {
          posX: posX,
          posY: posY
        };
        return;
      }

      if (isDoubleTapping && allowZoom) {
        if (_this.state.zoom === minZoom) {
          _this.fullZoomInOnPosition(posX, posY);
        } else {
          _this.reset();
        }

        return;
      } // Don't save the last touch if we are starting a simple touch move while panning is disabled


      if (allowPan) {
        _this.lastTouch = {
          posX: posX,
          posY: posY
        };
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "handleTouchMove", function (event) {
      if (!_this.props.allowTouchEvents) {
        event.preventDefault();
      }

      if (!_this.lastTouch) return;
      var _this$props3 = _this.props,
          maxZoom = _this$props3.maxZoom,
          minZoom = _this$props3.minZoom;
      var zoom = _this.state.zoom;

      if (event.touches.length === 1) {
        var _ref5 = [event.touches[0].pageX, event.touches[0].pageY],
            posX = _ref5[0],
            posY = _ref5[1]; // If we detect only one point, we shall just move the element

        var shiftX = posX - _this.lastTouch.posX;
        var shiftY = posY - _this.lastTouch.posY;

        _this.move(shiftX, shiftY);

        _this.lastShift = {
          x: shiftX,
          y: shiftY
        }; // Save data for the next move

        _this.lastTouch = {
          posX: posX,
          posY: posY
        };
        _this.lastTouchDistance = null;
      } else if (event.touches.length > 1) {
        // If we detect two points, we shall zoom up or down
        var _ref6 = [event.touches[0].pageX, event.touches[0].pageY],
            pos1X = _ref6[0],
            pos1Y = _ref6[1];
        var _ref7 = [event.touches[1].pageX, event.touches[1].pageY],
            pos2X = _ref7[0],
            pos2Y = _ref7[1];
        var distance = Math.sqrt(Math.pow(pos2X - pos1X, 2) + Math.pow(pos2Y - pos1Y, 2));

        if (_this.lastTouchDistance && distance && distance !== _this.lastTouchDistance) {
          if (_this.props.allowZoom) {
            zoom += (distance - _this.lastTouchDistance) / 100;

            if (zoom > maxZoom) {
              zoom = maxZoom;
            } else if (zoom < minZoom) {
              zoom = minZoom;
            }
          } // Change position using the center point between the two fingers


          var centerX = (pos1X + pos2X) / 2,
              centerY = (pos1Y + pos2Y) / 2;

          var _this$getNewPosition5 = _this.getNewPosition(centerX, centerY, zoom),
              _this$getNewPosition6 = (0, _slicedToArray2.default)(_this$getNewPosition5, 2),
              _posX = _this$getNewPosition6[0],
              _posY = _this$getNewPosition6[1];

          _this.setState({
            zoom: zoom,
            posX: _posX,
            posY: _posY,
            transitionDuration: 0
          });
        } // Save data for the next move


        _this.lastTouch = {
          posX: pos1X,
          posY: pos1Y
        };
        _this.lastTouchDistance = distance;
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "handleTouchStop", function () {
      if (_this.lastShift) {
        // Use the last shift to make a decelerating movement effect
        _this.startDeceleration(_this.lastShift.x, _this.lastShift.y);

        _this.lastShift = null;
      }

      _this.lastTouch = null;
      _this.lastTouchDistance = null;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "zoomIn", function (value) {
      var maxZoom = _this.props.maxZoom;
      var _this$state3 = _this.state,
          zoom = _this$state3.zoom,
          posX = _this$state3.posX,
          posY = _this$state3.posY;
      var prevZoom = zoom;
      zoom = zoom + value < maxZoom ? zoom + value : maxZoom;

      if (zoom !== prevZoom) {
        posX = posX * (zoom - 1) / (prevZoom > 1 ? prevZoom - 1 : prevZoom);
        posY = posY * (zoom - 1) / (prevZoom > 1 ? prevZoom - 1 : prevZoom);
      }

      _this.setState({
        zoom: zoom,
        posX: posX,
        posY: posY,
        transitionDuration: _this.props.animDuration
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "zoomOut", function (value) {
      var minZoom = _this.props.minZoom;
      var _this$state4 = _this.state,
          zoom = _this$state4.zoom,
          posX = _this$state4.posX,
          posY = _this$state4.posY;
      var prevZoom = zoom;
      zoom = zoom - value > minZoom ? zoom - value : minZoom;

      if (zoom !== prevZoom) {
        posX = posX * (zoom - 1) / (prevZoom - 1);
        posY = posY * (zoom - 1) / (prevZoom - 1);
      }

      _this.setState({
        zoom: zoom,
        posX: posX,
        posY: posY,
        transitionDuration: _this.props.animDuration
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "zoomToZone", function (relX, relY, relWidth, relHeight) {
      var maxZoom = _this.props.maxZoom;
      var _this$state5 = _this.state,
          zoom = _this$state5.zoom,
          posX = _this$state5.posX,
          posY = _this$state5.posY;

      var parentRect = _this.ref.current.parentNode.getBoundingClientRect();

      var prevZoom = zoom; // Calculate zoom factor to scale the zone

      var optimalZoomX = parentRect.width / relWidth;
      var optimalZoomY = parentRect.height / relHeight;
      zoom = Math.min(optimalZoomX, optimalZoomY, maxZoom); // Calculate new position to center the zone

      var rect = _this.ref.current.getBoundingClientRect();

      var centerX = rect.width / prevZoom / 2,
          centerY = rect.height / prevZoom / 2;
      var zoneCenterX = relX + relWidth / 2,
          zoneCenterY = relY + relHeight / 2;
      posX = (centerX - zoneCenterX) * zoom;
      posY = (centerY - zoneCenterY) * zoom;

      _this.setState({
        zoom: zoom,
        posX: posX,
        posY: posY,
        transitionDuration: _this.props.animDuration
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "reset", function () {
      _this.setState(_objectSpread(_objectSpread({}, _this.constructor.defaultState), {}, {
        transitionDuration: _this.props.animDuration
      }));
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getZoom", function () {
      return _this.state.zoom;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isDoubleTapping", function () {
      var touchTime = new Date().getTime();
      var isDoubleTap = touchTime - _this.lastTouchTime < _this.props.doubleTouchMaxDelay && touchTime - _this.lastDoubleTapTime > _this.props.doubleTouchMaxDelay;

      if (isDoubleTap) {
        _this.lastDoubleTapTime = touchTime;
        return true;
      }

      _this.lastTouchTime = touchTime;
      return false;
    });
    _this.ref = /*#__PURE__*/(0, _react.createRef)(); // Last cursor position

    _this.lastCursor = null; // Last touch position

    _this.lastTouch = null; // Last touch time in milliseconds

    _this.lastTouchTime = 0; // Last double tap time (used to limit multiple double tap) in milliseconds

    _this.lastDoubleTapTime = 0; // Last calculated distance between two fingers in pixels

    _this.lastTouchDistance = null; // Last request animation frame identifier

    _this.lastRequestAnimationId = null; // Determines if the device has a mouse

    _this.hasMouseDevice = window.matchMedia('(pointer: fine)').matches;
    _this.state = _objectSpread(_objectSpread({}, _this.constructor.defaultState), {}, {
      transitionDuration: props.animDuration
    });
    return _this;
  }
  /**
   * Calculates new translate positions for CSS transformations.
   * @param  {Number} x     Relative (rect-based) X position in pixels
   * @param  {Number} y     Relative (rect-based) Y position in pixels
   * @param  {Number} zoom  Scale value
   * @return {Array}        New X and Y positions
   */


  (0, _createClass2.default)(PrismaZoom, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate(_, prevState) {
      if (this.props.onZoomChange && this.state.zoom !== prevState.zoom) {
        this.props.onZoomChange(this.state.zoom);
      }

      if (this.props.onPanChange && (this.state.posX !== prevState.posX || this.state.posY !== prevState.posY)) {
        this.props.onPanChange({
          posX: this.state.posX,
          posY: this.state.posY
        });
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.ref.current.addEventListener('wheel', this.handleMouseWheel, {
        passive: false
      });

      if (this.hasMouseDevice) {
        // Apply mouse events only to devices which include an accurate pointing device
        this.ref.current.addEventListener('mousedown', this.handleMouseStart, {
          passive: false
        });
        this.ref.current.addEventListener('mousemove', this.handleMouseMove, {
          passive: false
        });
        this.ref.current.addEventListener('mouseup', this.handleMouseStop, {
          passive: false
        });
        this.ref.current.addEventListener('mouseleave', this.handleMouseStop, {
          passive: false
        });
      } else {
        // Apply touch events to all other devices
        this.ref.current.addEventListener('touchstart', this.handleTouchStart, {
          passive: false
        });
        this.ref.current.addEventListener('touchmove', this.handleTouchMove, {
          passive: false
        });
        this.ref.current.addEventListener('touchend', this.handleTouchStop, {
          passive: false
        });
        this.ref.current.addEventListener('touchcancel', this.handleTouchStop, {
          passive: false
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.ref.current.removeEventListener('wheel', this.handleMouseWheel);

      if (this.hasMouseDevice) {
        this.ref.current.removeEventListener('mousedown', this.handleMouseStart);
        this.ref.current.removeEventListener('mousemove', this.handleMouseMove);
        this.ref.current.removeEventListener('mouseup', this.handleMouseStop);
        this.ref.current.removeEventListener('mouseleave', this.handleMouseStop);
      } else {
        this.ref.current.removeEventListener('touchstart', this.handleTouchStart);
        this.ref.current.removeEventListener('touchmove', this.handleTouchMove);
        this.ref.current.removeEventListener('touchend', this.handleTouchStop);
        this.ref.current.removeEventListener('touchcancel', this.handleTouchStop);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
          className = _this$props4.className,
          style = _this$props4.style,
          children = _this$props4.children;
      var _this$state6 = this.state,
          zoom = _this$state6.zoom,
          posX = _this$state6.posX,
          posY = _this$state6.posY,
          cursor = _this$state6.cursor,
          transitionDuration = _this$state6.transitionDuration;
      var attr = {
        ref: this.ref,
        onDoubleClick: this.handleDoubleClick.bind(this),
        className: className,
        style: _objectSpread(_objectSpread({}, style), {}, {
          transform: "translate3d(".concat(posX, "px, ").concat(posY, "px, 0) scale(").concat(zoom, ")"),
          transition: "transform ease-out ".concat(transitionDuration, "s"),
          cursor: cursor,
          touchAction: 'none',
          willChange: 'transform'
        })
      };
      return /*#__PURE__*/_react.default.createElement("div", attr, children);
    }
  }]);
  return PrismaZoom;
}(_react.PureComponent);

exports.default = PrismaZoom;
(0, _defineProperty2.default)(PrismaZoom, "propTypes", {
  children: _propTypes.default.node.isRequired,
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  minZoom: _propTypes.default.number,
  maxZoom: _propTypes.default.number,
  scrollVelocity: _propTypes.default.number,
  onZoomChange: _propTypes.default.func,
  onPanChange: _propTypes.default.func,
  animDuration: _propTypes.default.number,
  doubleTouchMaxDelay: _propTypes.default.number,
  decelerationDuration: _propTypes.default.number,
  allowZoom: _propTypes.default.bool,
  allowPan: _propTypes.default.bool,
  allowTouchEvents: _propTypes.default.bool
});
(0, _defineProperty2.default)(PrismaZoom, "defaultProps", {
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
  // Enable or disable zooming in place
  allowZoom: true,
  // Enable or disable panning in place
  allowPan: true,
  // By default, all touch events are caught (if set to true touch events propagate)
  allowTouchEvents: false
});
(0, _defineProperty2.default)(PrismaZoom, "defaultState", {
  // Transform scale value property
  zoom: 1,
  // Transform translateX value property
  posX: 0,
  // Transform translateY value property
  posY: 0,
  // Cursor style property
  cursor: 'auto'
});