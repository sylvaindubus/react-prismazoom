/* global intern */

import React from 'react'
import { mount, configure } from 'enzyme'
import { JSDOM } from 'jsdom'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'

import PrismaZoom from '../../src/index.js'

configure({ adapter: new Adapter() })

const { describe, it, beforeEach } = intern.getPlugin('interface.bdd')
const { expect } = intern.getPlugin('chai')

const documentHTML = '<!doctype html><html><head></head><body><div></div></body></html>'
const jsdom = new JSDOM(documentHTML, { pretendToBeVisual: true })
global.window = jsdom.window
global.window.matchMedia = () => ({
  matches: true,
})
global.document = jsdom.window.document
global.navigator = { userAgent: 'node.js' }

const [containerWidth, containerHeight] = [1440, 800]

const mockGetBoudingClientRect = (falseData) => {
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.className === 'prismaZoom') {
      // Return data for the PrismaZoom element
      const data = {
        width: 640,
        height: 360,
        top: 0,
        left: 0,
        right: 640,
        bottom: 360,
        ...falseData,
      }
      return data
    } else {
      // Return data for the parent element
      return {
        width: containerWidth,
        height: containerHeight,
        top: 0,
        left: 0,
        bottom: containerWidth,
        right: containerHeight,
      }
    }
  }
}

describe('components', () => {
  describe('PrismaZoom', () => {
    const props = {
      minZoom: 1,
      maxZoom: 5,
    }
    const component = mount(
      <PrismaZoom className="prismaZoom" {...props}>
        <div></div>
      </PrismaZoom>
    )
    const instance = component.instance()
    const defaultState = instance.state

    beforeEach(() => {
      // Re-initialize default state
      component.setState(defaultState)

      // Override clientWidth and clientHeight getters
      Object.defineProperty(document.body, 'clientWidth', {
        get: () => containerWidth,
        configurable: true,
      })
      Object.defineProperty(document.body, 'clientHeight', {
        get: () => containerHeight,
        configurable: true,
      })
    })

    it('renders correctly', () => {
      expect(component.prop('className')).to.equal('prismaZoom')
      expect(component.state('zoom')).to.equal(1)
    })

    describe('getNewPosition', () => {
      it('returns initial position if zoom is equal to 1', () => {
        expect(instance.getNewPosition(5, 5, 1)).to.eql([0, 0])
      })

      it('returns new position when zoom-in', () => {
        mockGetBoudingClientRect()
        expect(instance.getNewPosition(20, 20, 1.5)).to.eql([150, 80])
      })

      it('returns new position when zoom-out', () => {
        component.setState({ zoom: 1.5, posX: 150, posY: 80 })
        expect(instance.getNewPosition(20, 20, 1.25)).to.eql([75, 40])
      })
    })

    describe('getLimitedShift', () => {
      it('returns 0 if element cannot be panned', () => {
        expect(instance.getLimitedShift(10, 0, 1440, 0, 3195)).to.eql(0)
        expect(instance.getLimitedShift(-10, 0, 1440, 0, -1760)).to.eql(0)
      })
      it('returns limited shift if the shift is too high', () => {
        expect(instance.getLimitedShift(10, 0, 1440, -5, 3195)).to.eql(5)
        expect(instance.getLimitedShift(-10, 0, 1440, -1755, 1445)).to.eql(-5)
      })
      it('returns current shift if the move is far enough from borders', () => {
        expect(instance.getLimitedShift(10, 0, 1440, -1590, 1600)).to.eql(10)
        expect(instance.getLimitedShift(-10, 0, 1440, -1590, 1600)).to.eql(-10)
      })
    })

    describe('getCursor', () => {
      it('returns adapted cursor if element cannot be panned', () => {
        expect(instance.getCursor()).to.eql('auto')
      })
      it('returns adapted cursor if element can only be panned horizontally', () => {
        expect(instance.getCursor(true, false)).to.eql('ew-resize')
      })
      it('returns adapted cursor if element can only be panned vertically', () => {
        expect(instance.getCursor(false, true)).to.eql('ns-resize')
      })
      it('returns adapted cursor if element can be panned on both directions', () => {
        expect(instance.getCursor(true, true)).to.eql('move')
      })
    })

    describe('fullZoomInOnPosition', () => {
      it('zoom-in at the maximum value', () => {
        instance.fullZoomInOnPosition(5, 5)
        expect(instance.state).to.eql({
          zoom: 5,
          posX: 1260,
          posY: 700,
          cursor: 'auto',
          transitionDuration: 0.25,
        })
      })
    })

    describe('move', () => {
      it('does not changes position if panning is impossible', () => {
        instance.move(20, 20, 0)
        expect(instance.state.zoom).to.eql(1)
        expect(instance.state.posX).to.eql(0)
        expect(instance.state.posY).to.eql(0)
        expect(instance.state.cursor).to.eql('auto')
      })

      it('changes position toward bottom-right corner', () => {
        mockGetBoudingClientRect({ width: 1920, height: 1920, bottom: 1920, right: 1920 })
        component.setState({ zoom: 2, posX: 640, posY: 640 })
        instance.move(-20, -20, 0)
        expect(instance.state.posX).to.eql(620)
        expect(instance.state.posY).to.eql(620)
        expect(instance.state.cursor).to.eql('move')
      })

      it('changes position toward left-top corner with a limited shift', () => {
        mockGetBoudingClientRect({
          width: 1920,
          height: 1080,
          left: -10,
          top: -10,
          bottom: 1070,
          right: 1910,
        })
        component.setState({ zoom: 3, posX: 630, posY: 350 })
        instance.move(20, 20)
        expect(instance.state.posX).to.eql(640)
        expect(instance.state.posY).to.eql(360)
        expect(instance.state.cursor).to.eql('move')
      })

      it('changes position on X axis only', () => {
        mockGetBoudingClientRect({
          width: containerWidth * 2,
          height: 600,
          left: 0,
          top: 0,
          bottom: 600,
          right: containerWidth * 2,
        })
        component.setState({ zoom: 2, posX: 640, posY: 360 })
        instance.move(-20, -20)
        expect(instance.state.posX).to.eql(620)
        expect(instance.state.posY).to.eql(360)
        expect(instance.state.cursor).to.eql('ew-resize')
      })

      it('changes position on Y axis only', () => {
        mockGetBoudingClientRect({
          width: 600,
          height: containerHeight * 2,
          left: 0,
          top: 0,
          bottom: containerHeight * 2,
          right: 600,
        })
        component.setState({ zoom: 2, posX: 640, posY: 350 })
        instance.move(-20, -20)
        expect(instance.state.posX).to.eql(640)
        expect(instance.state.posY).to.eql(330)
        expect(instance.state.cursor).to.eql('ns-resize')
      })
    })

    describe('zoomIn', () => {
      it('increments the zoom value', () => {
        instance.zoomIn(3)
        expect(component.state('zoom')).to.equal(4)
        instance.zoomIn(3)
        expect(component.state('zoom')).to.equal(props.maxZoom)
      })
    })

    describe('zoomOut', () => {
      it('decrements the zoom value', () => {
        component.setState({ zoom: props.maxZoom })
        instance.zoomOut(3)
        expect(component.state('zoom')).to.equal(2)
        instance.zoomOut(3)
        expect(component.state('zoom')).to.equal(props.minZoom)
      })
    })

    describe('zoomToZone', () => {
      it('zoom-in on the specified zone', () => {
        mockGetBoudingClientRect()
        component.setState({ zoom: 1, posX: 640, posY: 360 })
        instance.zoomToZone(400, 10, 230, 340)
        expect(instance.state).to.eql({
          zoom: 2.3529411764705883,
          posX: -458.8235294117647,
          posY: 0,
          cursor: 'auto',
          transitionDuration: 0.25,
        })
      })
    })

    describe('reset', () => {
      it('resets the state', () => {
        instance.reset()
        expect(instance.state).to.eql(defaultState)
      })
    })

    describe('getZoom', () => {
      it('returns the current zoom value', () => {
        component.setState({ zoom: 2 })
        expect(instance.getZoom()).to.eql(2)
      })
    })
  })
})
