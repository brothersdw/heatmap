import React, { useRef, useEffect, useState } from "react";
import { getCountyMapData } from "../../api/get-counties-mapbox-data"; // Import function to fetch map data
import { getStateMapData } from "../../api/get-state-mapbox-data";
import { getDiseases } from "../../api/get-diseases"; // Import function to fetch diseases
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css"; // !Important for map styling
import { DiseaseDropDown, MapPopup, Legend, DataBox } from "."; // Import components for map display
const publicToken = require("../../tokens.json").publicToken; // Can exchange this for your own mapbox token
const diseases = await getDiseases(); // Await fetch function for diseases and set diseases to response
const countyData = await getCountyMapData(); // Await fetch function for map data and set mData to response
const countyMapData = countyData.data;
const stateData = await getStateMapData();
const stateMapData = stateData.data;

mapboxgl.accessToken = publicToken; // !Important you have to have this or you will not be able display the map

export const HeatMap = () => {
  const mapContainer = useRef(null);
  // const [map, setMap] = useState(null);
  const [lng, setLng] = useState(-83.75357); // Set default lng, lat to center on Florida. Also used for DataBox component display
  const [lat, setLat] = useState(27.791858);
  const [zoom, setZoom] = useState(5); // This will be used to set boundary state
  const [county, setCounty] = useState(); // Sets value of county for popup and data-box
  const [cursorX, setCursorX] = useState(); // Grabs the x position of the cursor for the MapPopup component
  const [cursorY, setCursorY] = useState(); // Grabs the y position of the cursor for the MapPopup component
  const [popupVisible, setPopupVisible] = useState(false); // Controls visible state of MapPopup
  const [cases, setCases] = useState({}); // Controls number of cases displayed in MapPopup and DataBox components as well as disease description in MapPopup
  const [mapContainerBottom, setMapContainerBottom] = useState(0); // This state is used for positioning of the Legend and DiseaseDropdown components
  const [mapContainerLeft, setMapContainerLeft] = useState(0); // This state is used for positioning of the Legend and DiseaseDropdown components
  const [mapContainerRight, setMapContainerRight] = useState(0); // This state is used for positioning of the Legend and DiseaseDropdown components
  const [disease, setDisease] = useState(diseases.data[0].disease_cases_key);
  const [countyStateView, setCountyStateView] = useState("counties");
  useEffect(() => {
    const zoomThreshold = 4.7;
    // Set countyThresholds for colors based on numbers (this will look at the value of the disease_cases_key to
    // set color when added to map)
    // const countyThresholds = {
    //   property: disease,
    //   stops: [
    //     [0, "#ebebeb"],
    //     [100, "#34dbe0"],
    //     [10000, "#347ce0"],
    //     [50000, "#9f37db"],
    //     [100000, "#4d15a1"],
    //     [200000, "#2c0566"],
    //   ],
    // };

    // const stateThresholds = {
    //   property: disease,
    //   stops: [
    //     [100000, "#ebebeb"],
    //     [1000000, "#34dbe0"],
    //     [2000000, "#347ce0"],
    //     [4000000, "#9f37db"],
    //     [6000000, "#4d15a1"],
    //     [8000000, "#2c0566"],
    //   ],
    // };
    // Create map
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
      projection: "globe",
    });
    // Map on load event
    map.on("load", () => {
      // Add counties as source, use countyMapData as data and set type to geojson
      map.addSource("counties", {
        type: "geojson",
        data: countyMapData,
        maxZoom: zoomThreshold,
      });

      // Add state as source, use countyMapData as data and set type to geojson
      map.addSource("state", {
        type: "geojson",
        data: stateMapData,
      });

      // Add layer of type fill and create white border for counties
      map.addLayer(
        {
          id: "counties",
          type: "fill",
          minzoom: zoomThreshold, // !Important: Switches counties/state layer according to zoom level
          paint: {
            "fill-outline-color": "white",
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", disease], // Color Thresholds property
              0, // Set countyThresholds for colors based on numbers (this will look at
              "#ebebeb", // the value of the disease_cases_key to set color when added to map)
              100,
              "#34dbe0",
              10000,
              "#347ce0",
              50000,
              "#9f37db",
              100000,
              "#4d15a1",
              200000,
              "#2c0566",
            ],
            "fill-opacity": 1,
          },
          source: "counties",
        },
        "building"
      );

      map.addLayer(
        {
          id: "state",
          type: "fill",
          maxzoom: zoomThreshold, // !Important: Switches counties/state layer according to zoom level
          paint: {
            "fill-outline-color": "white",
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", disease], // Color Thresholds property
              0, // Set countyThresholds for colors based on numbers (this will look at
              "#ebebeb", // the value of the disease_cases_key to set color when added to map)
              1000000,
              "#34dbe0",
              2000000,
              "#347ce0",
              4000000,
              "#9f37db",
              6000000,
              "#4d15a1",
              8000000,
              "#2c0566",
            ],
            "fill-opacity": 1,
          },
          source: "state",
        },
        "building"
      );

      // When the map is moved (e.g. grabbed and rotated, zoom out, zoom in, etc...) set lng and lat
      // to current value with fixed decimal figure of 4 and set zoom to current zoom with fixed decimal figure of 2
      map.on("move", "counties", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });
      map.on("move", "state", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });

      // When cursor enters county boundaries in Florida set popupVisible to true and change cursor to a "pointer" from "grab"
      // map.on("mouseenter", zoom > 4.7 ? "counties" : "state", (e) => {
      map.on("mouseenter", "counties", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseenter", "state", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });

      // When the cursor is moving within county boundaries of Florida set cursorx and y, set county and set cases
      // map.on("mousemove", zoom > 4.7 ? "counties" : "state", (e) => {
      map.on("mousemove", "counties", (e) => {
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        setCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
        const diseaseCases = e.features[0].properties[`${disease}`]; // Set to value of current disease_cases_key
        // for the county the cursor is currently in. Used in Databox and MapPopup components

        // Set to object that has a diseas_cases_key value of the currently set disease in the diseases array
        const disease_data = diseases.data.filter(
          (d) => d.disease_cases_key === disease
        );
        const disease_description = disease_data[0].disease_description; // Grab disease description from disease data. Used
        // in MapPopup component.

        // Set cases to object with cases and disease
        setCases((c) => {
          return {
            ...c,
            cases: diseaseCases,
            disease: disease_description,
          };
        });
      });
      map.on("mousemove", "state", (e) => {
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        setCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
        const diseaseCases = e.features[0].properties[`${disease}`]; // Set to value of current disease_cases_key
        // for the county the cursor is currently in. Used in Databox and MapPopup components

        // Set to object that has a diseas_cases_key value of the currently set disease in the diseases array
        const disease_data = diseases.data.filter(
          (d) => d.disease_cases_key === disease
        );
        const disease_description = disease_data[0].disease_description; // Grab disease description from disease data. Used
        // in MapPopup component.

        // Set cases to object with cases and disease
        setCases((c) => {
          return {
            ...c,
            cases: diseaseCases,
            disease: disease_description,
          };
        });
      });

      // When mouse leaves county boundaries set popupVisible to false and set cursor back to "grab" from "pointer"
      map.on("mouseleave", "counties", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
      map.on("mouseleave", "state", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
    });

    // Unmount map
    return () => map.remove();
  }, [disease]);

  useEffect(() => {
    zoom > 4.7 ? setCountyStateView("counties") : setCountyStateView("state");
  });

  // useEffect to set bottom left and right of map for responsive positioning of Legend and DiseaseDropdown
  useEffect(() => {
    const mapContainerElement = document.getElementById("map-container");
    setMapContainerBottom(
      mapContainerElement.offsetHeight + mapContainerElement.offsetTop
    );
    setMapContainerLeft(mapContainerElement.offsetLeft);
    setMapContainerRight(mapContainerElement.offsetWidth);
  });

  return (
    <div style={{ position: "relative", height: "auto" }}>
      <Legend
        mapTopPos={mapContainerBottom}
        mapLeftPos={mapContainerRight}
        zoom={zoom}
      />
      {popupVisible && (
        <MapPopup
          county={county}
          cursorX={cursorX}
          cursorY={cursorY}
          display={popupVisible}
          cases={cases}
        />
      )}
      <DataBox lng={lng} lat={lat} county={county} cases={cases} zoom={zoom} />
      <DiseaseDropDown
        mapLeftPos={mapContainerLeft}
        mapTopPos={mapContainerBottom}
        disease={disease}
        setDisease={setDisease}
        diseases={diseases}
      />
      <div ref={mapContainer} id="map-container" className="map-container" />
    </div>
  );
};
