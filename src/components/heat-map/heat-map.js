import React, { useRef, useEffect, useState } from "react";
import { getMapData } from "../../api/get-mapbox-data";
import { getDiseases } from "../../api/get-diseases";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import { DiseaseDropDown, MapPopup, Legend, DataBox } from ".";
const publicToken = require("../../tokens.json").publicToken; // Can exchange this for your own mapbox token
const diseases = await getDiseases();
const mData = await getMapData();
const mapData = await mData.data;

mapboxgl.accessToken = publicToken;

export const HeatMap = () => {
  const mapContainer = useRef(null);
  // const [map, setMap] = useState(null);
  const [lng, setLng] = useState(-83.75357); // Set default lng, lat to center on Florida
  const [lat, setLat] = useState(27.791858);
  const [zoom, setZoom] = useState(5); // This will be used to set boundary state
  const [county, setCounty] = useState(); // Sets value of county for popup and data-box
  const [cursorX, setCursorX] = useState();
  const [cursorY, setCursorY] = useState();
  const [popupVisible, setPopupVisible] = useState(false);
  const [cases, setCases] = useState({});
  const [mapContainerBottom, setMapContainerBottom] = useState(0);
  const [mapContainerLeft, setMapContainerLeft] = useState(0);
  const [mapContainerRight, setMapContainerRight] = useState(0);
  const [disease, setDisease] = useState(diseases.data[0].disease_cases_key);
  const getRandomColor = () => {
    return `#${Math.random().toString(16).substring(2, 8)}`;
  };

  const randomColors = getRandomColor();
  useEffect(() => {
    const thresholds = {
      property: disease,
      stops: [
        [0, "#ebebeb"],
        [100, "#34dbe0"],
        [10000, "#347ce0"],
        [50000, "#9f37db"],
        [100000, "#4d15a1"],
        [200000, "#2c0566"],
      ],
    };
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
    });
    map.on("load", () => {
      map.addSource("counties", {
        type: "geojson",
        data: mapData,
      });
      map.addLayer(
        {
          id: "counties",
          type: "fill",
          source: "counties",
        },
        "building"
      );
      map.setPaintProperty("counties", "fill-color", {
        property: thresholds.property,
        stops: thresholds.stops,
      });
      map.on("move", "counties", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });
      map.on("mouseenter", "counties", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mousemove", "counties", (e) => {
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        setCounty(e.features[0].properties.county);
        const diseaseCases = e.features[0].properties[`${disease}`];
        const disease_data = diseases.data.filter(
          (d) => d.disease_cases_key === disease
        );
        const disease_description = disease_data[0].disease_description;
        setCases((c) => {
          return {
            ...c,
            cases: diseaseCases,
            disease: disease_description,
          };
        });
      });
      map.on("mouseleave", "counties", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
      // setMap(map);
    });

    return () => map.remove();
  }, [disease]);
  const mapHeight = mapContainer;
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
      <Legend mapTopPos={mapContainerBottom} mapLeftPos={mapContainerRight} />
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
