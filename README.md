# react-prismazoom

## About

A pan and zoom component for React, using CSS transformations.

Depends only upon prop-types, react and react-dom modules.  
Works on both desktop and mobile.

Online demo [here!](https://sylvaindubus.github.io/react-prismazoom/)

### Zoom features :mag_right:
* Zoom with the mouse wheel or a two-finger pinch
* Zoom using double-click or double-tap
* Zoom on the selected area and center

### Pan features :point_up_2:
* Pan with the mouse pointer or with one finger when zoomed-in
* Intuitive panning depending on available space when zoomed-in
* Adjusts cursor style to indicate in which direction the element can be moved

## Contribution

If you want to contribute, feel free to send a merge request or open a discussion. Currently, I just have time to maintain the package, but not enough to make big changes or add important features.

All contributions would be quite appreciated! 😉

Among changes I would like to apply:
~~- Migrate to TypeScript~~
~~- Transform to a functional component (that could help split the code)~~
- Make motion logic less dependent to React
- Replace Enzyme with another testing library

## Breaking changes on v3

* The `locked` prop has been replaced by `allowZoom` and `allowPan` to handle zooming and panning events separately

## Breaking changes on v2

* The package now requires React v16.3 or higher (to use react references)
* The zoom feature through gestures or the mouse wheel got some improvements to react better with all devices. You may need to adjust the `scrollVelocity` property passed to the component to keep the same effect.


## Installation

### Install the component

```bash
$ npm i -D react-prismazoom
```

### Install the demo

This project includes a full-featured application demo.

First clone the project.

Go to the subfolder:
```bash
$ cd demo
```

Then, install it:

```bash
$ npm ci
```

Run the Webpack Dev Server:

```bash
$ npm start
```

### Run unit tests

⚠️ There are no unit tests anymore since the previously used library is deprecated and doesn't support React 18. The current test suite needs to be adapted using a different library.

## Usage

### Implementation

```jsx
import PrismaZoom from 'react-prismazoom'

<PrismaZoom>
  <img src="my-image.png" />
  <p>A text that can be zoomed and dragged</p>
</PrismaZoom>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- |  --- |
| className | string | None | Class name to apply on the zoom wrapper. |
| style | object | None | Style to apply on the zoom wrapper. Note that *transform*, *transition*, *cursor*, *touch-action* and *will-change* cannot be overridden. Example: `style={{backgroundColor: 'red'}}`. |
| minZoom | number | 1 | Minimum zoom ratio. |
| maxZoom | number | 5 | Maximum zoom ratio. |
| scrollVelocity | number | 0.1 | Zoom increment or decrement on each scroll wheel detection. |
| onZoomChange | function | null | Function called each time the zoom value changes. |
| onPanChange | function | null | Function called each time the posX or posY value changes (aka images was panned). |
| animDuration | number | 0.25 | Animation duration (in seconds). |
| doubleTouchMaxDelay | number | 300 | Max delay between two taps to consider a double tap (in milliseconds). |
| decelerationDuration | number | 750 | Decelerating movement duration after a mouse up or a touch end event (in milliseconds). |
| allowZoom | boolean | true | Enable or disable zooming in place.
| allowPan | boolean | true | Enable or disable panning in place.
| allowTouchEvents | boolean | false | Enables touch event propagation. |
| allowParentPanning | boolean | false | When enabled, allows the parent element/page to pan with single-finger touch events as long as zoom = 1. |

**Note:** all props are optional.

### Public Methods

These functions can be called from parent components.

**zoomIn (value)**
*Increments the zoom with the given value.*
Param {value: Number} : Zoom value

**zoomOut (value)**
*Decrements the zoom with the given value.*
Param {value: Number} : Zoom value

**zoomToZone (relX, relY, relWidth, relHeight)**
*Zoom in on the specified zone with the given relative coordinates and dimensions.*
Param {relX: Number}: Relative X position of the zone left-top corner in pixels
Param {relY: Number}: Relative Y position of the zone left-top corner in pixels
Param {relWidth: Number}: Zone width in pixels
Param {relHeight: Number}: Zone height in pixels

**reset ()**
*Resets the component to its initial state.*

**getZoom ()**
*Returns the current zoom value.*
Return {Number} : Zone value

## License

React PrismaZoom is licensed under the ISC license. See the LICENSE.md file for more details.
