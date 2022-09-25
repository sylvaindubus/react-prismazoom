# Changelog

## [3.1.0] - 2022-09-25
- Added prop to allow parent movement (thanks SaadTaimoor-TFD)
- Bump again dev dependencies

## [3.0.4] - 2022-09-24
- Bump dev dependencies to prevent vulnerabilities

## [3.0.3] - 2022-05-08
- Fix panning on React 18
- Improve splitting between lib and demo app
- Temporary disable unit tests

## [3.0.2] - 2022-04-23
- Update dependencies
- Include React 18 as peer dependencies

## [3.0.1] - 2022-04-17
- Fix zooming on mobile when pan is disabled

## [3.0.0] - 2022-01-24
- Replace locked prop with allowZoom and allowPan to handle zooming and panning events separately (thanks joshuacerdenia)

## [2.2.0] - 2022-01-11
- Add a prop `allowTouchEvents` to allow event propagation (thanks fkrauthan)

## [2.1.0] - 2021-12-26
- Add a prop to lock the component

## [2.0.3] - 2021-07-06
- Prevent error when component is unmounted but still moving
- Fix double-tap bug on Safari iOS

## [2.0.2] - 2021-06-23
- Includes React 17 as peer dependencies

## [2.0.1] - 2021-04-22
- Use wrapper boundaries instead of specified props

## [2.0.0] - 2021-02-26
- Update all dependencies
- Rework on the example page
- Improve mousewheel zoom
- Fix and improve unit tests
- Fix chrome warning during zoom
- Change some eslint and babel rules
- Improve reference handling

## [1.1.5] - 2021-02-26
- Added onPanChange callback method (thanks Frozen-byte)

## [1.1.4] - 2020-12-25
- Fix calculating absolute position (thanks sbekaert)

## [1.1.3] - 2019-10-09
- Update some dependencies, clean code

## [1.1.2] - 2018-12-11
- Remove preventDefault from touchStop event

## [1.1.1] - 2018-09-20
- Fix another bug on mouse wheel zoom

## [1.1.0] - 2018-09-19
- Add movement deceleration on mouse up and touch end events
- Greatly improve example project
- Fix blur effect on mouse wheel zoom

## [1.0.3] - 2018-08-10
- Add unit tests using [Intern](https://theintern.io/)
- Improve performances with translate3d and will-change CSS properties
- Fix a bug on panning when the element is not centered

## [1.0.2] - 2018-08-08
- Fix on README documentation
- Lower React dependencies (v16.0)

## [1.0.1] - 2018-08-08
- Improve README documentation
- Add code documentation
- Add NPM and GitLab CI config files
- Add License
- Add animation duration in props
- Add zoom in and out buttons in example project
