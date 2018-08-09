import React from 'react'
import { mount, render, configure } from 'enzyme'
import { JSDOM } from 'jsdom'
import Adapter from 'enzyme-adapter-react-16'

import PrismaZoom from '../../src/index.js'

configure({ adapter: new Adapter() })

const { describe, it, beforeEach } = intern.getPlugin('interface.bdd')
const { expect } = intern.getPlugin('chai')

const documentHTML = '<!doctype html><html><head></head><body><div></div></body></html>'
const jsdom = new JSDOM(documentHTML, { pretendToBeVisual: true })
global.window = jsdom.window
global.document = jsdom.window.document
global.navigator = { userAgent: 'node.js' }

Object.defineProperty(document.body, 'clientWidth', { get: () => ( 1440 ) })
Object.defineProperty(document.body, 'clientHeight', { get: () => ( 900 ) })

describe('components', () => {
  describe('PrismaZoom', () => {
    const props = {
      minZoom: 1,
      maxZoom: 5
    }
    const component = mount(<PrismaZoom {...props}><div style={{width: 640, height: 360}}></div></PrismaZoom>)
    const instance = component.instance()
    const defaultState = instance.state

    beforeEach(() => {
      component.setState(defaultState)
    })

    it('renders correctly', () => {
      expect(component.prop('className')).to.equal(null)
      expect(component.state('zoom')).to.equal(1)
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
        instance.zoomToZone(400, 10, 230, 340)
        expect(instance.state).to.eql({
          zoom: 2.6470588235294117,
          posX: -1363.235294117647,
          posY: -476.4705882352941,
          cursor: 'auto',
          useTransition: true
        })
      })
    })

    describe('reset', () => {
      it('resets the state', () => {
        component.setState({ zoom: 2, useTransition: false })
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