# react-prismazoom

## About

A pan and zoom component for React, using CSS transformations.

Depends only upon prop-types, react and react-dom modules.
Works on both desktop and mobile.

### Zoom features :mag_right:
* Zoom with the mouse-wheel or a two-finger pinch
* Zoom using double-click or double-tap
* Zoom on selected area and center

### Pan features :point_up_2:
* Pan with the mouse pointer or with one finger when zoomed-in
* Intuitive panning depending on available space when zoomed-in
* Adjusts cursor style to indicate in which direction the element can be moved

## Installation

### Install the component
```bash
npm i -SD react-prismazoom
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
| style | object | None | Style to apply on the zoom wrapper. Note that *transform*, *transition*, *cursor* and *touch-action* cannot be overridden. Example: `style={{backgroundColor: red}}`. |
| minZoom | number | 1 | Minimum zoom ratio. |
| maxZoom | number | 5 | Maximum zoom ratio. |
| scrollVelocity | number | 0.1 | Zoom increment or decrement on each scroll wheel detection. |
| onZoomChange | function | null | Function called each time the zoom value changes. |
| leftBoundary | number | 0 | Left screen-relative boundary, used to enlarge panning zone. |
| rightBoundary | number | 0 | Right screen-relative boundary, used to enlarge panning zone. |
| topBoundary | number | 0 | Top screen-relative boundary, used to enlarge panning zone. |
| bottomBoundary | number | 0 | Bottom screen-relative boundary, used to enlarge panning zone. |
| animDuration | number | 0.25 | Animation duration (in seconds). |

**Note:** all props are optional.

### Public methods

These functions can be called from parent components.

**zoomUp (value) ⇒ `undefined`**
Increments the zoom ratio with the given value.

**zoomDown (value) ⇒ `undefined`**
Decrements the zoom ratio with the given value.

**zoomToZone (relX, relY, relWidth, relHeight) ⇒ `undefined`**
Zoom to the specified zone on relative coordinates at given width and height dimensions.

**reset () ⇒ `undefined`**
Reset the component to its initial state.

**getZoom () ⇒ `number`**
Return the current zoom value.

## License

React PrismaZoom is licensed under the MIT license. See the LICENSE.md file for more details.