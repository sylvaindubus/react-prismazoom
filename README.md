# react-prismazoom

## About

A pan and zoom component for React, using CSS transformations.

Depends only upon prop-types, react and react-dom modules.  
Works on both desktop and mobile.

Online demo [here!](https://sylvaindubus.github.io/react-prismazoom/)

### Zoom features :mag_right:
* Zoom with the mouse-wheel or a two-finger pinch
* Zoom using double-click or double-tap
* Zoom on selected area and center

### Pan features :point_up_2:
* Pan with the mouse pointer or with one finger when zoomed-in
* Intuitive panning depending on available space when zoomed-in
* Adjusts cursor style to indicate in which direction the element can be moved

## Contribution

If you want to contribute, feel free to send a merge request or open a discussion. Currently, I just have time to maintain the package, but not enough to make big changes or add important features.

All contribution would be quite appreciated! 😉

Among changes I would like to apply:
- Migrate to TypeScript
- Transform to a functional component (that could help splitting the code)
- Make motion logic less dependant to React

## Breaking changes on v2

* The package now requires React v16.3 or higher (in order to use react references)
* The zoom feature through gestures or mousewheel got some improvements to react better with all devices. You may need to adjust the `scrollVelocity` property passed to the component in order to keep the same effect.


## Installation

### Install the component
```bash
$ npm i -D react-prismazoom
```
### Install the example project

This project includes a full-featured application example.

First clone the project.

Then, install it:
```bash
$ npm i
```
Run the Webpack Dev Server:
```bash
$ npm run start
```
Go to http://localhost:1664.

**Note:** sources of this example can be found in `example/src`.

### Run unit tests

You can either run all tests at once:
```bash
$ npm test
```

Or run tests each time a change on source files occured:
```bash
$ npm run test:watch
```

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
| pannable | boolean | true | Enable or disable panning in place. |
| locked | boolean | false | Disable all user's interactions. |

**Note:** all props are optional.

### Public methods

These functions can be called from parent components.

**zoomIn (value)**  
*Increments the zoom with the given value.*  
Param {value: Number} : Zoom value

**zoomOut (value)**  
*Decrements the zoom with the given value.*  
Param {value: Number} : Zoom value

**zoomToZone (relX, relY, relWidth, relHeight)**  
*Zoom-in on the specified zone with the given relative coordinates and dimensions.*  
Param {relX: Number} : Relative X position of the zone left-top corner in pixels  
Param {relY: Number} : Relative Y position of the zone left-top corner in pixels  
Param {relWidth: Number} : Zone width in pixels  
Param {relHeight: Number} : Zone height in pixels

**reset ()**  
*Resets the component to its initial state.*

**getZoom ()**  
*Returns the current zoom value.*  
Return {Number} : Zone value

## License

React PrismaZoom is licensed under the ISC license. See the LICENSE.md file for more details.
