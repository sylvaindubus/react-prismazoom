import React, { Component } from 'react'
import { render } from 'react-dom'

import PrismaZoom from '../../src'
import logo from './logo.svg'
import seal from './seal.jpg'
import './styles.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      zoom: 1
    }
  }
  onZoomChange = zoom => {
    this.setState({ zoom })
  }
  onDoubleClickOnCard = event => {
    event.preventDefault()
    event.stopPropagation()

    const prismaZoom = this.refs.prismaZoom
    const zoneRect = event.currentTarget.getBoundingClientRect()
    const layoutRect = event.currentTarget.parentNode.getBoundingClientRect()

    const zoom = prismaZoom.getZoom()

    if (zoom > 1) {
      prismaZoom.reset()
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
    prismaZoom.zoomToZone(relX, relY, relWidth, relHeight)
  }
  render () {
    return (
      <div className="App">
        <header className="App-header">
          <img className="App-logo" src={logo} alt="logo" />
        </header>
        <section className="App-wrapper">
          <PrismaZoom className="App-zoom" topBoundary={120} onZoomChange={this.onZoomChange} ref="prismaZoom">
            <img className="App-image" src={seal} alt="A cute seal" />
            <div className="App-card" onDoubleClick={this.onDoubleClickOnCard}>
              <h2>Fur seals</h2>
              <p>Fur seals are any of nine species of pinnipeds belonging to the subfamily Arctocephalinae in the family Otariidae. They are much more closely related to sea lions than true seals, and share with them external ears (pinnae), relatively long and muscular foreflippers, and the ability to walk on all fours. They are marked by their dense underfur, which made them a long-time object of commercial hunting.</p>
              <p>Eight species belong to the genus Arctocephalus and are found primarily in the Southern Hemisphere, while a ninth species also sometimes called fur seal, the northern fur seal (Callorhinus ursinus), belongs to a different genus and inhabits the North Pacific.</p>
              <p><a href="https://en.wikipedia.org/wiki/Fur_seal" target="_blank">https://en.wikipedia.org/wiki/Fur_seal</a></p>
            </div>
          </PrismaZoom>
        </section>
        <footer className="App-footer">
          <span>{`Zoom: ${parseInt((this.state.zoom * 100))}%`}</span>
        </footer>
      </div>
    )
  }
}

render(<App />, document.getElementById('root'))
