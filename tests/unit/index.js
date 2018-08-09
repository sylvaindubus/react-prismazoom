import React from 'react'
import { shallow, render, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import PrismaZoom from '../../src/index.js'

configure({ adapter: new Adapter() })

const { describe, it } = intern.getPlugin('interface.bdd')
const { expect } = intern.getPlugin('chai')

describe('components', () => {
  describe('PrismaZoom', () => {
    const component = shallow(<PrismaZoom><p></p></PrismaZoom>)
    const instance = component.instance()

    it('renders correctly', () => {
      expect(component.type()).to.equal('div')
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
  })
})