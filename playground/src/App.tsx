import type { Map as MaplibreMap } from "maplibre-gl"
import type { ExpressionExample } from "./data/expressions"
import { useCallback, useRef, useState } from "react"
import { ExpressionPanel } from "./components/expression-panel"
import { MapComponent } from "./components/map-component"
import { pointData, polygonData } from "./data/sampleData"
import "./App.css"

function App() {
  const mapRef = useRef<MaplibreMap | null>(null)
  const [currentExpression, setCurrentExpression] = useState<ExpressionExample | null>(null)

  const handleMapLoad = useCallback((map: MaplibreMap) => {
    mapRef.current = map

    // Add sample data sources
    map.addSource("points", {
      type: "geojson",
      data: pointData,
      promoteId: "id",
    })

    map.addSource("polygons", {
      type: "geojson",
      data: polygonData,
      promoteId: "id",
    })

    // Add default layers
    map.addLayer({
      id: "polygon-layer",
      type: "fill",
      source: "polygons",
      paint: {
        "fill-color": "#888888",
        "fill-opacity": 0.4,
      },
    })

    map.addLayer({
      id: "point-layer",
      type: "circle",
      source: "points",
      paint: {
        "circle-radius": 8,
        "circle-color": "#007cbf",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    })

    map.addLayer({
      id: "label-layer",
      type: "symbol",
      source: "points",
      layout: {
        "text-field": ["get", "name"],
        "text-offset": [0, 2],
        "text-anchor": "top",
        "text-size": 12,
      },
      paint: {
        "text-color": "#000000",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1,
      },
    })
  }, [])

  const handleExpressionSelect = useCallback((expression: ExpressionExample) => {
    setCurrentExpression(expression)

    if (!mapRef.current)
      return

    const map = mapRef.current
    const layerId = expression.layerType === "circle"
      ? "point-layer"
      : expression.layerType === "fill"
        ? "polygon-layer"
        : expression.layerType === "symbol" ? "label-layer" : "point-layer"

    // Apply the expression to the appropriate paint property
    if (expression.layerType === "symbol" && expression.paintProperty === "text-field") {
      map.setLayoutProperty(layerId, expression.paintProperty, expression.expression)
    }
    else {
      map.setPaintProperty(layerId, expression.paintProperty, expression.expression)
    }
  }, [])

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>MapLibre Expression Playground</h1>
        <ExpressionPanel onExpressionSelect={handleExpressionSelect} />
        {currentExpression && (
          <div className="expression-code">
            <h3>Expression Code:</h3>
            <pre>{JSON.stringify(currentExpression.expression, null, 2)}</pre>
          </div>
        )}
      </div>
      <div className="map-container">
        <MapComponent onMapLoad={handleMapLoad} />
      </div>
    </div>
  )
}

export default App
