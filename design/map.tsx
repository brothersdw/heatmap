import { useState, useRef, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import { useMeasuredSize } from "https://framer.com/m/framer/useMeasuredSize.js"

import { useStore } from "./store.js"

import mapboxgl from "mapbox-gl"

const diseases = [
  {
    id: "4cae675e-a022-11ee-897d-3bc734afd10a",
    disease_cases_key: "testDisease1Cases",
    disease_description: "Test Disease 1",
  },
  {
    id: "4cae7442-a022-11ee-897d-3bc734afd10a",
    disease_cases_key: "testDisease2Cases",
    disease_description: "Test Disease 2",
  },
  {
    id: "4cae7668-a022-11ee-897d-3bc734afd10a",
    disease_cases_key: "testDisease3Cases",
    disease_description: "Test Disease 3",
  },
  {
    id: "4cae76f4-a022-11ee-897d-3bc734afd10a",
    disease_cases_key: "testDisease4Cases",
    disease_description: "Test Disease 4",
  },
  {
    id: "4cae7776-a022-11ee-897d-3bc734afd10a",
    disease_cases_key: "testDisease5Cases",
    disease_description: "Test Disease 5",
  },
]

enum LocationType {
  City = "City",
  Custom = "Custom",
}

const cityCoordinates = {
  "Amsterdam, Netherlands": {
    latitude: 52.370216,
    longitude: 4.895168,
    zoom: 12,
  },
  "Austin, USA": { latitude: 30.267153, longitude: -97.743057, zoom: 10 },
  "Barcelona, Spain": { latitude: 41.385063, longitude: 2.173404 },
  "Beijing, China": { latitude: 39.904202, longitude: 116.407394 },
  "Chicago, USA": { latitude: 41.878113, longitude: -87.629799 },
  "Detroit, USA": { latitude: 42.331429, longitude: -83.045753 },
  "Dubai, UAE": { latitude: 25.204849, longitude: 55.270782 },
  "Helsinki, Findland": { latitude: 60.169857, longitude: 24.938379 },
  "Hong Kong, China": { latitude: 22.280308, longitude: 114.177007 },
  "Las Vegas, USA": { latitude: 36.169941, longitude: -115.139832 },
  "London, United Kingdom": { latitude: 51.507351, longitude: -0.127758 },
  "Los Angles, USA": { latitude: 34.052235, longitude: -118.243683 },
  "New York City, USA": { latitude: 40.712776, longitude: -74.005974 },
  "Paris, France, USA": { latitude: 48.856613, longitude: 2.352222 },
  "Portland, USA": { latitude: 45.51223, longitude: -122.658722 },
  "Rome, Italy": { latitude: 41.902782, longitude: 12.496365 },
  "San Francisco, USA": { latitude: 37.774929, longitude: -122.419418 },
  "Seattle, USA": { latitude: 47.606209, longitude: -122.332069 },
  "Shanghai, China": { latitude: 31.230391, longitude: 121.473701 },
  Singapore: { latitude: 1.28431, longitude: 103.869666 },
  "Sydney, Australia": { latitude: -33.87276, longitude: 151.20534 },
  "Tokyo, Japan": { latitude: 35.687427, longitude: 139.786879 },
  "Vienna, Austria": { latitude: 48.208176, longitude: 16.373819 },
  "Washington DC, USA": { latitude: 38.893, longitude: -77.032 },
}

const floridaCoordinates = {
  longitude: -81.5158 - 1.5,
  latitude: 27.6648 + 1,
  zoom: 6,
}

const leonCountyCoordinates = {
  longitude: -84.1857 - 0.1,
  latitude: 30.4906,
  zoom: 10,
}

const Cities = {
  coordinates: cityCoordinates,
  names: Object.keys(cityCoordinates).sort(),
}

const optionsAndTitles = (obj: { [key: string]: string }) => {
  return Object.keys(obj)
    .map((key) => {
      return {
        key,
        value: obj[key],
      }
    })
    .reduce(
      (lists, kvp) => {
        lists.titles.push(kvp.key)
        lists.options.push(kvp.value)
        return lists
      },
      { titles: [] as string[], options: [] as string[], dict: obj }
    )
}

const coreStyles = optionsAndTitles({
  Streets: "mapbox://styles/mapbox/streets-v11",
  Outdoors: "mapbox://styles/mapbox/outdoors-v11",
  Light: "mapbox://styles/mapbox/light-v10",
  Dark: "mapbox://styles/mapbox/dark-v10",
  Satellite: "mapbox://styles/mapbox/satellite-v9",
  "Satellite Streets": "mapbox://styles/mapbox/satellite-streets-v11",
  "Navigation Day": "mapbox://styles/mapbox/navigation-day-v1",
  "Navigation Night": "mapbox://styles/mapbox/navigation-night-v1",
  "Outdoors Custom": "mapbox://styles/mattbarr/clqo01kkz00hj01ql32im30du",
  Pink: "mapbox://styles/mattbarr/clqo1ciry00ht01p55b2725y9",
})

/**
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 300
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function Map(props) {
  const [selectedCountyState, setSelectedCountyState] = useState(null)

  const map = useRef(null)
  const mapContainer = useRef(null)
  mapboxgl.accessToken = props.accessToken

  const size = useMeasuredSize(mapContainer)
  const width = size?.width ? size.width : 400
  const height = size?.height ? size.height : 300

  const [store, setStore] = useStore()
  const [disease, setDisease] = useState(diseases[0].disease_cases_key)

  const storeRef = useRef(store)

  const thresholds = {
    property: disease,
    stops: [
      [0, "#0019FF"],
      [100, "#3315D2"],
      [10000, "#6611A5"],
      [50000, "#990E79"],
      [100000, "#CC0A4C"],
      [200000, "#FF061F"],
    ],
  }

  const {
    style,
    locationType,
    city,
    longitude,
    latitude,
    zoom,
    anonymousStyle,
  } = props

  const center =
    locationType === LocationType.City
      ? [Cities.coordinates[city].longitude, Cities.coordinates[city].latitude]
      : [longitude, latitude]

  const getColorForCases = (cases) => {
    // Iterate through each stop to find the appropriate color
    for (let i = 0; i < thresholds.stops.length; i++) {
      if (cases < thresholds.stops[i][0]) {
        return thresholds.stops[i][1]
      }
    }
    return thresholds.stops[thresholds.stops.length - 1][1] // default to last color if no match
  }

  const blendWithWhite = (color) => {
    const rgb = parseInt(color.slice(1), 16)
    const r = ((rgb >> 16) + 255) >> 1
    const g = (((rgb >> 8) & 0x00ff) + 255) >> 1
    const b = ((rgb & 0x0000ff) + 255) >> 1
    return `rgb(${r}, ${g}, ${b})`
  }

  // Function to calculate the bounding box of a polygon
  const getBoundingBox = (coordinates) => {
    let minX, maxX, minY, maxY
    coordinates[0].forEach((coord) => {
      if (minX === undefined || coord[0] < minX) minX = coord[0]
      if (maxX === undefined || coord[0] > maxX) maxX = coord[0]
      if (minY === undefined || coord[1] < minY) minY = coord[1]
      if (maxY === undefined || coord[1] > maxY) maxY = coord[1]
    })
    return [minX, minY, maxX, maxY]
  }

  // Function to calculate the centroid of a bounding box
  const getCentroid = ([minX, minY, maxX, maxY]) => {
    return [(minX + maxX) / 2, (minY + maxY) / 2]
  }

  const initializeMap = () => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: anonymousStyle,
      // style: "mapbox://styles/mattbarr/clqo1ciry00ht01p55b2725y9",
      center: center,
      zoom: zoom,
      projection: "globe",
    })

    map.current.on("load", function () {
      fetch(
        // "https://raw.githubusercontent.com/danielcs88/fl_geo_json/master/fl-state.json"
        // "https://raw.githubusercontent.com/brothersdw/heatmap-api/main/data/florida-county-boundaries.geojson"
        "https://raw.githubusercontent.com/matthew-barr/mapbox/main/florida_mapbox_data.json"
      )
        .then((response) => response.json())
        .then((data) => {
          // Add the GeoJSON data as a source
          map.current.addSource("florida", {
            type: "geojson",
            data: data,
          })
          map.current.addSource("counties", {
            type: "geojson",
            data: data,
          })

          // map.current.addLayer({
          //     id: "leon-county",
          //     type: "fill",
          //     source: "counties",
          //     paint: {
          //         "fill-outline-color": "white",
          //         "fill-color": "transparent",
          //         "fill-opacity": 0,
          //     },
          //     filter: ["==", ["get", "county"], "Leon County"], // Filter for Leon County
          // })

          data.features.forEach((feature) => {
            const countyName = feature.properties.county

            const fillLayerId = `${countyName}-fill`
            const lineLayerId = `${countyName}-line`

            map.current.addLayer({
              id: fillLayerId,
              type: "fill",
              source: {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [feature],
                },
              },
              paint: {
                "fill-outline-color": "white",
                "fill-color": "yellow",
                "fill-opacity": 0,
                "fill-opacity-transition": { duration: 0 },
              },
            })

            map.current.addLayer({
              id: lineLayerId,
              type: "line",
              source: {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [feature],
                },
              },
              paint: {
                "line-color": "white",
                "line-width": 0, // Default border width
                "line-width-transition": { duration: 0 },
              },
            })

            map.current.on("click", function (e) {
              // Check if the click is on one of the county layers

              const features = map.current.queryRenderedFeatures(e.point, {
                layers: ["counties"],
              })

              if (features.length === 0) {
                // Clicked outside the counties layer
                setStore((prevStore) => {
                  if (prevStore.selectedCounty["county"]) {
                    let countyName = prevStore.selectedCounty["county"]
                    map.current.setPaintProperty(
                      `${countyName}-fill`,
                      "fill-color",
                      "transparent"
                    )
                    map.current.setPaintProperty(
                      `${countyName}-fill`,
                      "fill-opacity",
                      0
                    )
                    map.current.setPaintProperty(
                      `${countyName}-line`,
                      "line-width",
                      0
                    )
                  }
                  return {
                    ...prevStore,
                    flSelected: false,
                    selectedDisease: "Hepatitis",
                    selectedCounty: {},
                  }
                })
                map.current.setPaintProperty("counties", "fill-opacity", 0)
                map.current.flyTo({
                  center: [
                    floridaCoordinates.longitude,
                    floridaCoordinates.latitude,
                  ],
                  zoom: floridaCoordinates.zoom,
                  // duration: 12000,
                  essential: true,
                })
              }
            })

            function uniqueFlatten(arr) {
              // Flatten the array
              const flattened = arr.flat()

              // Remove duplicates by converting to a Set and back to an array
              const unique = [...new Set(flattened)]

              return unique
            }

            map.current.on("click", fillLayerId, function (e) {
              // Calculate the centroid of the bounding box
              let deselect = false
              const selectedCounty = storeRef.current.selectedCounty.county
              if (selectedCounty === removeFillSuffix(fillLayerId)) {
                deselect = true
              }
              const bbox = getBoundingBox(feature.geometry.coordinates)

              const centroid = getCentroid(uniqueFlatten(bbox))

              // Define a suitable zoom level

              if (deselect) {
                map.current.flyTo({
                  center: [
                    floridaCoordinates.longitude,
                    floridaCoordinates.latitude,
                  ],
                  zoom: floridaCoordinates.zoom,
                  // duration: 12000,
                  essential: true,
                })
              } else {
                if (storeRef.current.selectedCounty.county) {
                  map.current.flyTo({
                    center: centroid,

                    essential: true, // This ensures the animation is performed
                  })
                } else {
                  const zoomLevel = 9 // Adjust as necessary
                  map.current.flyTo({
                    center: centroid,
                    zoom: zoomLevel,
                    essential: true, // This ensures the animation is performed
                  })
                }
              }

              let newSelectedCounty = deselect
                ? {}
                : { ...e.features[0].properties }

              setStore((prevStore) => {
                if (prevStore.selectedCounty["county"]) {
                  let countyName = prevStore.selectedCounty["county"]
                  map.current.setPaintProperty(
                    `${countyName}-fill`,
                    "fill-color",
                    "transparent"
                  )
                  map.current.setPaintProperty(
                    `${countyName}-fill`,
                    "fill-opacity",
                    0
                  )
                  map.current.setPaintProperty(
                    `${countyName}-line`,
                    "line-width",
                    0
                  )
                }

                return {
                  ...prevStore,
                  flSelected: deselect ? false : true,
                  selectedCounty: newSelectedCounty,
                }
              })
            })

            function removeFillSuffix(str) {
              return str.replace("-fill", "")
            }

            map.current.on("mouseenter", fillLayerId, function (e) {
              const cases = e.features[0].properties[disease]
              const originalColor = getColorForCases(cases)
              const blendedColor = blendWithWhite(originalColor)

              const selectedCounty = storeRef.current.selectedCounty.county
              if (selectedCounty === removeFillSuffix(fillLayerId)) return
              map.current.setPaintProperty(
                fillLayerId,
                "fill-color",
                blendedColor
              )
              map.current.setPaintProperty(fillLayerId, "fill-opacity", 0.5)
              map.current.setPaintProperty(lineLayerId, "line-width", 2)
            })

            map.current.on("mouseleave", fillLayerId, function () {
              const selectedCounty = storeRef.current.selectedCounty.county
              if (selectedCounty === removeFillSuffix(fillLayerId)) return
              map.current.setPaintProperty(
                fillLayerId,
                "fill-color",
                "transparent"
              )
              map.current.setPaintProperty(fillLayerId, "fill-opacity", 0)
              map.current.setPaintProperty(lineLayerId, "line-width", 0)
            })
          })

          map.current.addLayer(
            {
              id: "counties",
              type: "fill",
              paint: {
                "fill-outline-color": "white",
                "fill-opacity": store.flSelected ? 0.8 : 0,
                "fill-opacity-transition": { duration: 200 },
              },
              source: "counties",
            },
            "building"
          )

          map.current.setPaintProperty("counties", "fill-color", {
            property: thresholds.property,
            stops: thresholds.stops,
          })

          // map.current.addLayer({
          //     id: "florida-layer",
          //     type: "fill",
          //     source: "florida",
          //     paint: {
          //         "fill-color": "#006BB4",
          //         "fill-opacity": store.flSelected ? 0.5 : 0,
          //     },
          //     layout: {
          //         visibility: "visible",
          //     },
          // })

          // map.current.addLayer({
          //     id: "outline",
          //     type: "line",
          //     source: "florida",
          //     layout: {},
          //     paint: {
          //         "line-color": "#006BB4",
          //         "line-width": 2,
          //     },
          // })
          // map.current.setLayoutProperty(
          //     "outline",
          //     "visibility",
          //     store.flSelected ? "visible" : "none"
          // )
          map.current.setLayoutProperty(
            "counties",
            "visibility",
            store.flSelected ? "none" : "visible"
          )

          map.current.setFog({
            "horizon-blend": 0.001,
            "star-intensity": 0.15,
            color: "rgba(255,255,255, 0.2)",
            "high-color": "rgba(66, 88, 106, 0.1)",
            // "space-color": "rgba(66, 88, 106, 1.0)",
            // "space-color": "rgba(0, 0, 0, 1.0)",
          })
        })
        .catch((error) =>
          console.error("Error loading the GeoJSON data:", error)
        )
    })
    map.current.on("mousemove", "counties", (e) => {
      setStore({
        hoveringCountyName: e.features[0].properties.county,
        hoveringCounty: { ...e.features[0].properties },
      })
    })

    map.current.on("mouseenter", "counties", function () {
      setStore({ flHover: true })
      map.current.setPaintProperty("counties", "fill-opacity", 0.8)
    })

    // map.current.on("mouseenter", "leon-county", function () {
    //     setStore({ flHover: true })
    //     map.current.setPaintProperty("leon-county", "fill-opacity", 0.5)
    // })
    // map.current.on("mouseleave", "leon-county", function () {
    //     setStore({ flHover: false })
    //     map.current.setPaintProperty("leon-county", "fill-opacity", 0)
    // })

    map.current.on("mouseleave", "counties", function () {
      let flStatus = false
      setStore((prevStore) => {
        flStatus = prevStore.flSelected

        return { flHover: false }
      })

      if (flStatus) {
        map.current.setPaintProperty("counties", "fill-opacity", 0.8)
      } else {
        map.current.setPaintProperty("counties", "fill-opacity", 0)
      }
      // map.current.setPaintProperty("leon-county", "fill-opacity", 0)
    })

    let lineStatus = false
    // map.current.on("click", "counties", function (e) {
    //     setStore((prevStore) => {
    //         const flStatus = prevStore.flSelected

    //         if (flStatus) {
    //             lineStatus = false
    //         } else {
    //             lineStatus = true
    //             map.current.flyTo({
    //                 center: [
    //                     floridaCoordinates.longitude,
    //                     floridaCoordinates.latitude,
    //                 ],
    //                 zoom: floridaCoordinates.zoom,
    //                 // duration: 12000,
    //                 essential: true,
    //             })
    //         }

    //         return { flSelected: lineStatus }
    //     })

    //     const visibility = lineStatus ? "visible" : "none"
    //     map.current.setLayoutProperty("outline", "visibility", visibility)
    //     map.current.setLayoutProperty("counties", "visibility", !visibility)
    //     map.current.setPaintProperty(
    //         "counties",
    //         "fill-opacity",
    //         lineStatus ? 0.8 : 0
    //     )
    // })
  }

  const updateCountyStyle = () => {
    if (map.current && store.selectedCounty["county"]) {
      const layerId = `${store.selectedCounty.county}-fill` // Make sure this matches your layer ID convention
      map.current.setPaintProperty(
        layerId,
        "fill-color",
        blendWithWhite("#FFFFFF")
      )
      map.current.setPaintProperty(layerId, "fill-opacity", 0.5) // Adjust opacity as needed
    }
  }

  // for table selection
  // useEffect(() => {
  //     if (store.selectedCounty) {
  //         console.log("store effect", store.selectedCounty)
  //     }
  // }, [store.selectedCounty])

  useEffect(() => {
    // Ensure this runs after the map and the county data are fully loaded
    if (map.current && map.current.isStyleLoaded()) {
      updateCountyStyle()
    }
  }, [store, map.current])

  useEffect(() => {
    if (map.current) return
    initializeMap()
    // Cleanup function
    return () => {
      setStore({
        flSelected: false,
        flHover: false,
        hoveringCountyName: "",
        selectedCounty: {},
      })
    }
  }, [])

  useEffect(() => {
    if (map.current) {
      map.current.resize()
    }
  }, [width, height])

  // useEffect(() => {
  //     if (map.current) {
  //         map.current.jumpTo({ center: center, zoom: zoom })
  //     }
  // }, [center, zoom])

  useEffect(() => {
    if (map.current) {
      // map.current.setStyle(
      //     "mapbox://styles/mattbarr/clqo1ciry00ht01p55b2725y9"
      // )
      map.current.setStyle(anonymousStyle)
    }
  }, [anonymousStyle])

  useEffect(() => {
    storeRef.current = store
  }, [store])

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    />
  )
}

Map.defaultProps = {
  locationType: LocationType.City,
  city: "Amsterdam, Netherlands",
  latitude: 52.375,
  longitude: 4.9,
  zoom: 12,
  showLocationText: false,
}

addPropertyControls(Map, {
  accessTokenURL: {
    type: ControlType.String,
    title: "Access token URL",
    placeholder: "from your Map account",
    hidden(props) {
      return !!props.accessToken
    },
  },
  accessToken: {
    type: ControlType.String,
    title: "Token",
    displayTextArea: true,
    defaultValue:
      "pk.eyJ1IjoibWF0dGJhcnIiLCJhIjoiY2xxZmV0MjB5MHRtbTJsbWhhNzVoZ2hsMSJ9.mulMbE_EW3ZNAEjqqYu00Q",
  },
  locationType: {
    title: "Location",
    type: ControlType.Enum,
    options: [LocationType.City, LocationType.Custom],
    optionTitles: ["Pick a city", "Enter numbers"],
  },
  city: {
    type: ControlType.Enum,
    options: Cities.names,
    title: "City",
    hidden: (props) => props.locationType === LocationType.Custom,
  },
  longitude: {
    type: ControlType.Number,
    min: -180,
    max: 180,
    step: 0.001,
    title: "Longitude",
    hidden: (props) => props.locationType === LocationType.City,
  },
  latitude: {
    type: ControlType.Number,
    min: -90,
    max: 90,
    step: 0.001,
    title: "Latitude",
    hidden: (props) => props.locationType === LocationType.City,
  },
  zoom: {
    type: ControlType.Number,
    min: 0,
    max: 22,
    title: "Zoom",
    step: 0.1,
    hidden: (props) => props.locationType === LocationType.City,
  },
  anonymousStyle: {
    type: ControlType.Enum,
    options: coreStyles.options,
    optionTitles: coreStyles.titles,
    title: "Map Style",
  },
})
