import React, { ComponentRef, MouseEvent } from 'react'

import PrismaZoom from 'react-prismazoom'
import backgroundOne from './images/radeau-de-la-meduse.jpg'
import backgroundTwo from './images/eruption-du-vesuve.jpg'
import './App.css'

function App() {
  const prismaZoom = React.useRef<ComponentRef<typeof PrismaZoom>>(null)

  const [zoom, setZoom] = React.useState(1)
  const [allowZoom, setAllowZoom] = React.useState(true)
  const [allowPan, setAllowPan] = React.useState(true)

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onClickOnZoomOut = () => {
    prismaZoom.current?.zoomOut(1)
  }

  const onClickOnZoomIn = () => {
    prismaZoom.current?.zoomIn(1)
  }

  const onClickOnLock = () => {
    setAllowPan((allowPan) => !allowPan)
    setAllowZoom((allowZoom) => !allowZoom)
  }

  const onDoubleClickOnCard = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!prismaZoom.current || !event.currentTarget?.parentNode) return

    const zoneRect = event.currentTarget.getBoundingClientRect()
    const layoutRect = (event.currentTarget.parentNode as Element).getBoundingClientRect()

    const zoom = prismaZoom.current.getZoom()

    if (zoom > 1) {
      prismaZoom.current?.reset()
      return
    }

    const [relX, relY] = [(zoneRect.left - layoutRect.left) / zoom, (zoneRect.top - layoutRect.top) / zoom]
    const [relWidth, relHeight] = [zoneRect.width / zoom, zoneRect.height / zoom]
    prismaZoom.current?.zoomToZone(relX, relY, relWidth, relHeight)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>react-prismazoom</h1>
        <h2>A pan and zoom component for React, using CSS transformations.</h2>
      </header>

      <section className="App-wrapper">
        <PrismaZoom className="App-zoom" onZoomChange={onZoomChange} maxZoom={8} ref={prismaZoom}>
          <div className="App-image" style={{ backgroundImage: `url(${backgroundOne})` }}></div>
          <article className="App-card" onDoubleClick={onDoubleClickOnCard}>
            <header className="App-cardHeader">
              <h3>The Raft of the Medusa</h3>
              <span>Théodore Géricault</span>
            </header>
            <p>
              The Raft of the Medusa (French: Le Radeau de la Méduse) – originally titled Scène de Naufrage (Shipwreck
              Scene) – is an oil painting of 1818–19 by the French Romantic painter and lithographer Théodore Géricault
              (1791–1824). Completed when the artist was 27, the work has become an icon of French Romanticism.
            </p>
            <p>
              <a href="https://en.wikipedia.org/wiki/The_Raft_of_the_Medusa" target="_blank" rel="noreferrer">
                Go to Wikipedia.
              </a>
            </p>
            <footer>
              <strong>Tip: </strong>double-click on this card to zoom. 😉
            </footer>
          </article>
        </PrismaZoom>

        <footer className="App-footer">
          <div className="App-indicator">
            <button className="App-button" onClick={onClickOnZoomOut}>
              <svg className="App-buttonIcon" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm4-9H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2z" />
              </svg>
            </button>
            <span className="App-zoomLabel">{Math.round(zoom * 100)}%</span>
            <button className="App-button" onClick={onClickOnZoomIn}>
              <svg className="App-buttonIcon" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm4-9h-3V8a1 1 0 0 0-2 0v3H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2z" />
              </svg>
            </button>
          </div>
        </footer>
      </section>

      <section className="App-wrapper">
        <PrismaZoom className="App-zoom" allowZoom={allowZoom} allowPan={allowPan} maxZoom={8}>
          <div className="App-image" style={{ backgroundImage: `url(${backgroundTwo})` }}></div>
          <article className="App-card">
            <header className="App-cardHeader">
              <h3>Vesuvius in Eruption</h3>
              <span>Joseph Mallord William Turner</span>
            </header>
            <p>
              The eighteenth-century fascination with volcanoes, and Vesuvius in particular, deepened in the nineteenth
              century, fuelled by the eruptions of Vesuvius in 1794, 1807, 1819, and 1822.
            </p>
          </article>
        </PrismaZoom>

        <footer className="App-footer">
          <div className="App-indicator">
            <button className="App-button" onClick={onClickOnLock}>
              <svg className="App-buttonIcon" viewBox="0 0 24 24">
                {!allowPan && !allowZoom ? (
                  <path d="M12 13a1.49 1.49 0 0 0-1 2.61V17a1 1 0 0 0 2 0v-1.39A1.49 1.49 0 0 0 12 13zm5-4V7A5 5 0 0 0 7 7v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3zM9 7a3 3 0 0 1 6 0v2H9zm9 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
                ) : (
                  <path d="M12 13a1.49 1.49 0 0 0-1 2.61V17a1 1 0 0 0 2 0v-1.39A1.49 1.49 0 0 0 12 13zm5-4H9V7a3 3 0 0 1 5.12-2.13 3.08 3.08 0 0 1 .78 1.38 1 1 0 1 0 1.94-.5 5.09 5.09 0 0 0-1.31-2.29A5 5 0 0 0 7 7v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3zm1 10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z" />
                )}
              </svg>
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

export default App
