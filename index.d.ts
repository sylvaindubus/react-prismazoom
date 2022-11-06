import React from "react";

export default class PrismaZoom extends React.Component {
    static propTypes: {
        children: any;
        className: any;
        style: any;
        minZoom: any;
        maxZoom: any;
        scrollVelocity: any;
        onZoomChange: any;
        onPanChange: any;
        animDuration: any;
        doubleTouchMaxDelay: any;
        decelerationDuration: any;
        allowZoom: any;
        allowPan: any;
        allowTouchEvents: any;
        allowParentPanning: any;
    };
    static defaultProps: {
        className: any;
        style: {};
        minZoom: number;
        maxZoom: number;
        scrollVelocity: number;
        onZoomChange: any;
        onPanChange: any;
        animDuration: number;
        doubleTouchMaxDelay: number;
        decelerationDuration: number;
        allowZoom: boolean;
        allowPan: boolean;
        allowTouchEvents: boolean;
        allowParentPanning: boolean;
    };
    static defaultState: {
        zoom: number;
        posX: number;
        posY: number;
        cursor: string;
    };
    constructor(props: any);
    ref: any;
    lastCursor: {
        posX: number;
        posY: number;
    } | {
        posX: number;
        posY: number;
    };
    lastTouch: {
        posX: number;
        posY: number;
    } | {
        posX: number;
        posY: number;
    } | {
        posX: number;
        posY: number;
    } | {
        posX: number;
        posY: number;
    };
    lastTouchTime: number;
    lastDoubleTapTime: number;
    lastTouchDistance: any;
    lastRequestAnimationId: number;
    hasMouseDevice: boolean;
    state: any;
    /**
     * Calculates new translate positions for CSS transformations.
     * @param  {Number} x     Relative (rect-based) X position in pixels
     * @param  {Number} y     Relative (rect-based) Y position in pixels
     * @param  {Number} zoom  Scale value
     * @return {Array}        New X and Y positions
     */
    getNewPosition: (x: number, y: number, zoom: number) => any[];
    /**
     * Calculates the narrowed shift for panning actions.
     * @param  {Number} shift      Initial shift in pixels
     * @param  {Number} minLimit   Minimum limit (left or top) in pixels
     * @param  {Number} maxLimit   Maximum limit (right or bottom) in pixels
     * @param  {Number} minElement Left or top element position in pixels
     * @param  {Number} maxElement Right or bottom element position in pixels
     * @return {Number}            Narrowed shift
     */
    getLimitedShift: (shift: number, minLimit: number, maxLimit: number, minElement: number, maxElement: number) => number;
    /**
     * Determines cursor style.
     * @param  {Boolean} canMoveOnX Element can be panned on the X axis
     * @param  {Boolean} canMoveOnY Element can be panned on the Y axis
     * @return {String}             Cursor style
     */
    getCursor: (canMoveOnX: boolean, canMoveOnY: boolean) => string;
    /**
     * Applies a full-zoom on the specified X and Y positions
     * @param  {Number} x Relative (rect-based) X position in pixels
     * @param  {Number} y Relative (rect-based) Y position in pixels
     */
    fullZoomInOnPosition: (x: number, y: number) => void;
    /**
     * Moves the element by incrementing its position with given X and Y values.
     * @param  {Number} shiftX             Position change to apply on X axis in pixels
     * @param  {Number} shiftY             Position change to apply on Y axis in pixels
     * @param  {Number} transitionDuration Transition duration (in seconds)
     */
    move: (shiftX: number, shiftY: number, transitionDuration?: number) => void;
    /**
     * Trigger a decelerating movement after a mouse up or a touch end event, using the last movement shift.
     * @param  {Number} lastShiftOnX Last shift on the X axis in pixels
     * @param  {Number} lastShiftOnY Last shift on the Y axis in pixels
     */
    startDeceleration: (lastShiftOnX: number, lastShiftOnY: number) => void;
    /**
     * Event handler on scroll.
     * @param  {MouseEvent} event Mouse event
     */
    handleMouseWheel: (event: MouseEvent) => void;
    /**
     * Event handler on double click.
     * @param  {MouseEvent} event Mouse event
     */
    handleDoubleClick: (event: MouseEvent) => void;
    /**
     * Event handler on mouse down.
     * @param  {MouseEvent} event Mouse event
     */
    handleMouseStart: (event: MouseEvent) => void;
    /**
     * Event handler on mouse move.
     * @param  {MouseEvent} event Mouse event
     */
    handleMouseMove: (event: MouseEvent) => void;
    lastShift: {
        x: number;
        y: number;
    } | {
        x: number;
        y: number;
    };
    /**
     * Event handler on mouse up or mouse out.
     * @param  {MouseEvent} event Mouse event
     */
    handleMouseStop: (event: MouseEvent) => void;
    /**
     * Event handler on touch start.
     * Zoom-in at the maximum scale if a double tap is detected.
     * @param  {TouchEvent} event Touch event
     */
    handleTouchStart: (event: TouchEvent) => void;
    /**
     * Event handler on touch move.
     * Either move the element using one finger or zoom-in with a two finger pinch.
     * @param  {TouchEvent} event Touch move
     */
    handleTouchMove: (event: TouchEvent) => void;
    /**
     * Event handler on touch end or touch cancel.
     * @param  {TouchEvent} event Touch move
     */
    handleTouchStop: () => void;
    /**
     * Increments the zoom with the given value.
     * @param  {Number} value Zoom value
     */
    zoomIn: (value: number) => void;
    /**
     * Decrements the zoom with the given value.
     * @param  {Number} value Zoom value
     */
    zoomOut: (value: number) => void;
    /**
     * Zoom-in on the specified zone with the given relative coordinates and dimensions.
     * @param  {Number} relX      Relative X position of the zone left-top corner in pixels
     * @param  {Number} relY      Relative Y position of the zone left-top corner in pixels
     * @param  {Number} relWidth  Zone width in pixels
     * @param  {Number} relHeight Zone height in pixels
     */
    zoomToZone: (relX: number, relY: number, relWidth: number, relHeight: number) => void;
    /**
     * Resets the component to its initial state.
     */
    reset: () => void;
    /**
     * Returns the current zoom value.
     * @return {Number} Zoom value
     */
    getZoom: () => number;
    /**
     * Check if the user is doing a double tap gesture.
     * @return {Boolean} Result of the checking
     */
    isDoubleTapping: () => boolean;
    componentDidUpdate(_: any, prevState: any): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): any;
}
