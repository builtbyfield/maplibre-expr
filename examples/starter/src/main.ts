import type { FeatureCollection, Point } from "geojson"

import type { Quake } from "./sources"

import { syncGlobalState } from "@builtbyfield/maplibre-expr"
import { Map as MapLibreMap, Popup, setWorkerUrl } from "maplibre-gl"
// Hand maplibre-gl its worker explicitly, so Vite copies it into the build.
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url"

import { DARK, LIGHT } from "./palette"
import { QUAKES } from "./sources"
import { buildStyle } from "./style"
import "maplibre-gl/dist/maplibre-gl.css"
import "@fontsource-variable/inter/opsz.css"

setWorkerUrl(workerUrl)

const quakesUrl = `${import.meta.env.BASE_URL}quakes.geojson`
const dateLabel = document.querySelector("#date")!
const quakes = await fetch(quakesUrl)
  .then(response => response.ok ? response.json() as Promise<FeatureCollection<Point, Quake>> : Promise.reject(new Error(response.statusText)))
  .catch((error: unknown) => {
    dateLabel.textContent = "The earthquake data didn't load. Reload the page to try again."
    throw error
  })
const times = quakes.features.map(f => f.properties.time)
const start = Math.min(...times)
const end = Math.max(...times)

let palette = matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT
let now = end

const map = new MapLibreMap({
  container: "map",
  style: buildStyle(palette, quakesUrl, now),
  center: [160, 15],
  zoom: 2,
  attributionControl: { compact: true, customAttribution: "Earthquakes: <a href=\"https://earthquake.usgs.gov/\">USGS</a>" },
})

// The quake layer reads the time from global state, so moving the slider
// never rebuilds the style or calls setFilter. syncGlobalState also re-applies
// it if the style reloads (e.g. the theme toggle below).
let stopSync = syncGlobalState(map, "now", now)

const slider = document.querySelector<HTMLInputElement>("#time")!
const countLabel = document.querySelector("#count")!
slider.min = String(start)
slider.max = String(end)
slider.step = String(60 * 60 * 1000)
slider.value = String(now)

const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })
const formatTime = (time: number): string => dateFormat.format(time)

function setTime(time: number): void {
  now = time
  slider.value = String(time)
  stopSync()
  stopSync = syncGlobalState(map, "now", time)
  dateLabel.textContent = formatTime(time)
  countLabel.textContent = `${times.filter(t => t <= time).length.toLocaleString()} of ${times.length.toLocaleString()} quakes`
}
slider.addEventListener("input", () => setTime(Number(slider.value)))
setTime(now)

// Start the "about" card collapsed on small screens.
if (matchMedia("(max-width: 640px)").matches)
  document.querySelector<HTMLDetailsElement>("#about")!.open = false

// Play the month in about 20 seconds.
const playButton = document.querySelector<HTMLButtonElement>("#play")!
const playLabel = document.querySelector("#play-label")!
let playing = 0
function showPlaying(isPlaying: boolean): void {
  playButton.setAttribute("aria-pressed", String(isPlaying))
  playLabel.textContent = isPlaying ? "Pause" : "Play"
}
playButton.addEventListener("click", () => {
  if (playing) {
    cancelAnimationFrame(playing)
    playing = 0
    showPlaying(false)
    return
  }
  if (now >= end)
    setTime(start)
  showPlaying(true)
  let last = performance.now()
  const tick = (frame: number): void => {
    setTime(Math.min(end, now + ((frame - last) / 20_000) * (end - start)))
    last = frame
    if (now < end) {
      playing = requestAnimationFrame(tick)
    }
    else {
      playing = 0
      showPlaying(false)
    }
  }
  playing = requestAnimationFrame(tick)
})

// Switching theme swaps the palette; the diff keeps sources and state.
const themeButton = document.querySelector<HTMLButtonElement>("#theme")!
function showTheme(): void {
  const root = document.documentElement
  document.querySelector("#theme-label")!.textContent = palette === DARK ? "Light" : "Dark"
  root.dataset.mode = palette === DARK ? "dark" : "light"
  root.style.setProperty("--quake-shallow", palette.quakeShallow)
  root.style.setProperty("--quake-mid", palette.quakeMid)
  root.style.setProperty("--quake-deep", palette.quakeDeep)
  const layer = buildStyle(palette, quakesUrl, now).layers.find(l => l.id === "quakes")!
  document.querySelector("#json")!.textContent = JSON.stringify({ filter: "filter" in layer ? layer.filter : undefined, ...layer.layout, ...layer.paint }, null, 1)
}
themeButton.addEventListener("click", () => {
  palette = palette === DARK ? LIGHT : DARK
  map.setStyle(buildStyle(palette, quakesUrl, now), { diff: true })
  showTheme()
})
showTheme()

// Hover: feature state drives the outline width (see `ifFeatureState` in the layer).
let hovered: string | number | undefined
const popup = new Popup({ closeButton: false, closeOnClick: false })
map.on("mousemove", "quakes", (event) => {
  const feature = event.features?.[0]
  if (!feature)
    return
  if (hovered !== undefined)
    map.setFeatureState({ source: QUAKES, id: hovered }, { hover: false })
  hovered = feature.id
  map.setFeatureState({ source: QUAKES, id: hovered! }, { hover: true })
  map.getCanvas().style.cursor = "pointer"
  const { mag, place, time, depth } = feature.properties as Quake
  const title = Object.assign(document.createElement("div"), { className: "popup-title", textContent: `M${mag.toFixed(1)} ${place}` })
  const meta = Object.assign(document.createElement("div"), { className: "popup-meta", textContent: `${formatTime(time)}, ${Math.round(depth)} km deep` })
  const content = document.createElement("div")
  content.append(title, meta)
  popup.setLngLat(event.lngLat).setDOMContent(content).addTo(map)
})
map.on("mouseleave", "quakes", () => {
  if (hovered !== undefined)
    map.setFeatureState({ source: QUAKES, id: hovered }, { hover: false })
  hovered = undefined
  map.getCanvas().style.cursor = ""
  popup.remove()
})
