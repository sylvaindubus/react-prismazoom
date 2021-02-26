import React, { Component, createRef } from 'react'
import { render } from 'react-dom'

import PrismaZoom from '../../src'
import background from './radeau-de-la-meduse.jpg'
import './styles.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.prismaZoom = createRef()
    this.state = {
      zoom: 1
    }
  }

  onZoomChange = zoom => {
    this.setState({ zoom })
  }

  onPanChange = pos => {
    console.log(pos.posX, pos.posY)
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
          <PrismaZoom className="App-zoom" topBoundary={120} onZoomChange={this.onZoomChange} maxZoom={8} onPanChange={this.onPanChange} ref={this.prismaZoom}>
            <div className="App-image" style={{ backgroundImage: `url(${background})` }}></div>
            <article className="App-card" onDoubleClick={this.onDoubleClickOnCard}>
              <h3>The Raft of the Medusa</h3>
              <p>The Raft of the Medusa (French: Le Radeau de la Méduse) – originally titled Scène de Naufrage (Shipwreck Scene) – is an oil painting of 1818–19 by the French Romantic painter and lithographer Théodore Géricault (1791–1824). Completed when the artist was 27, the work has become an icon of French Romanticism.</p>
              <p><a href="https://en.wikipedia.org/wiki/The_Raft_of_the_Medusa" target="_blank" rel="noreferrer">Go to Wikipedia.</a></p>
              <footer><strong>Tip: </strong>double-click on this card to zoom. 😉</footer>
            </article>
          </PrismaZoom>
        </section>
        <footer className="App-footer">
          <div className="App-indicator">
            <button className="App-button" onClick={this.onClickOnZoomOut}>
              <svg className="App-buttonIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg></button>
            <span>{parseInt(this.state.zoom * 100)}%</span>
            <button className="App-button" onClick={this.onClickOnZoomIn}>
              <svg className="App-buttonIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
          </div>
        </footer>
      </div>
    )
  }
}

render(<App />, document.getElementById('root'))
