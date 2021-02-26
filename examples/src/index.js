import React, { Component, createRef } from 'react'
import { render } from 'react-dom'

import PrismaZoom from '../../src'
import sealHorizontal from './seal-horizontal.jpg'
import sealVertical from './seal-vertical.jpg'
import './styles.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.prismaZoom = createRef()
    this.state = {
      zoom: 1,
      posX: 0,
      posY: 0
    }
  }

  onZoomChange = zoom => {
    this.setState({ zoom })
  }

  onPanChange = pos => {
    this.setState({ ...pos })
  }

  onClickOnZoomOut = () => {
    this.prismaZoom.current.zoomOut(1)
  }

  onClickOnZoomIn = () => {
    this.prismaZoom.current.zoomIn(1)
  }

  onDoubleClickOnCard = event => {
    event.preventDefault()
    event.stopPropagation()

    const zoneRect = event.currentTarget.getBoundingClientRect()
    const layoutRect = event.currentTarget.parentNode.getBoundingClientRect()

    const zoom = this.prismaZoom.current.getZoom()

    if (zoom > 1) {
      this.prismaZoom.current.reset()
      return
    }

    const [relX, relY] = [
      (zoneRect.left - layoutRect.left) / zoom,
      (zoneRect.top - layoutRect.top) / zoom
    ]
    const [relWidth, relHeight] = [
      zoneRect.width / zoom,
      zoneRect.height / zoom
    ]
    this.prismaZoom.current.zoomToZone(relX, relY, relWidth, relHeight)
  }

  render () {
    return (
      <div className="App">
        <header className="App-header">
          <h1>react-prismazoom</h1>
          <h2>A pan and zoom component for React, using CSS transformations.</h2>
        </header>
        <section className="App-wrapper">
          <PrismaZoom className="App-zoom" topBoundary={120} onZoomChange={this.onZoomChange} onPanChange={this.onPanChange} ref={this.prismaZoom}>
            <img className="App-image onDesktop" src={sealHorizontal} alt="A cute seal" />
            <img className="App-image onMobile" src={sealVertical} alt="A cute seal on mobile" />
            <div className="App-card" onDoubleClick={this.onDoubleClickOnCard}>
              <h3>Double-click on this card ;-)</h3>
              <p>Fur seals are any of nine species of pinnipeds belonging to the subfamily Arctocephalinae in the family Otariidae. They are much more closely related to sea lions than true seals, and share with them external ears (pinnae), relatively long and muscular foreflippers, and the ability to walk on all fours. They are marked by their dense underfur, which made them a long-time object of commercial hunting.</p>
              <p>Eight species belong to the genus Arctocephalus and are found primarily in the Southern Hemisphere, while a ninth species also sometimes called fur seal, the northern fur seal (Callorhinus ursinus), belongs to a different genus and inhabits the North Pacific.</p>
              <p><a href="https://en.wikipedia.org/wiki/Fur_seal" target="_blank" rel="noreferrer">https://en.wikipedia.org/wiki/Fur_seal</a></p>
            </div>
          </PrismaZoom>
        </section>
        <footer className="App-footer">
          <div className="App-indicator">
            <button className="App-button" onClick={this.onClickOnZoomOut}>-</button>
            <span className="App-zoomLabel">{`Zoom: ${parseInt((this.state.zoom * 100))}%`}</span>
            <button className="App-button" onClick={this.onClickOnZoomIn}>+</button>
            <span className="App-posLabel">{`X: ${parseInt((this.state.posX))} Y: ${parseInt((this.state.posY))}`}</span>
          </div>
        </footer>
      </div>
    )
  }
}

render(<App />, document.getElementById('root'))
