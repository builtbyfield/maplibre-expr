import { useCallback, useRef } from "react"
import Map, { type MapRef } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

interface MapComponentProps {
  onMapLoad?: (map: maplibregl.Map) => void
}

export function MapComponent({ onMapLoad }: MapComponentProps) {
  const mapRef = useRef<MapRef>(null)

  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (map && onMapLoad) {
      onMapLoad(map)
    }
  }, [onMapLoad])

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 11,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      onLoad={handleMapLoad}
    />
  )
}
