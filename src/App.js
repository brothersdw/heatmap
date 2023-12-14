import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { motion } from "framer-motion";
const publicToken = require("./tokens.json").publicToken;
const floridaData = require("./data/florida-data.json");
const floridaCountyData = require("./data/florida-county-data.json");
mapboxgl.accessToken = publicToken;

const App = () => {
  const mapContainer = useRef(null);
  // const map = useRef(null);
  const [map, setMap] = useState(null);
  const [lng, setLng] = useState(-83.75357);
  const [lat, setLat] = useState(27.791858);
  const [mouseLocation, setMouseLocation] = useState([]);
  const [zoom, setZoom] = useState(5);
  const [county, setCounty] = useState();
  const [cursorX, setCursorX] = useState();
  const [cursorY, setCursorY] = useState();
  const [popupVisible, setPopupVisible] = useState(false);
  const [cases, setCases] = useState(0);
  const [mapContainerBottom, setMapContainerBottom] = useState(0);
  const [mapContainerLeft, setMapContainerLeft] = useState(0);
  const [mapContainerRight, setMapContainerRight] = useState(0);
  const [disease, setDisease] = useState(floridaCountyData.diseases[0].disease);
  const getRandomColor = () => {
    return `#${Math.random().toString(16).substring(2, 8)}`;
  };

  const randomColors = getRandomColor();
  useEffect(() => {
    const thresholdProperty =
      disease === "Test Disease1"
        ? "testDisease1Cases"
        : disease === "Test Disease2"
        ? "testDisease2Cases"
        : disease === "Test Disease3"
        ? "testDisease3Cases"
        : disease === "Test Disease4"
        ? "testDisease4Cases"
        : disease === "Test Disease5"
        ? "testDisease5Cases"
        : 0;
    const thresholds = {
      property: thresholdProperty,
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
        data: floridaCountyData,
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
        opacity: 0.4,
      });
      map.on("move", "counties", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });
      map.on("mouseenter", "counties", () => {
        setPopupVisible(true);
      });
      map.on("mousemove", "counties", (e) => {
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        // console.log(e.features[0].properties);
        setCounty(e.features[0].properties.county);
        setCases();
      });
      map.on("mouseleave", "counties", () => {
        setPopupVisible(false);
      });
      const mapContainerElement = document.getElementById("map-container");
      console.log(mapContainerElement.offsetHeight);
      setMapContainerBottom(
        mapContainerElement.offsetHeight + mapContainerElement.offsetTop
      );
      setMapContainerLeft(mapContainerElement.offsetLeft);
      setMapContainerRight(mapContainerElement.offsetWidth);
      setMap(map);
    });
    console.log("mapContainerHeight: ", mapContainerBottom);
    return () => map.remove();
  }, [disease]);

  return (
    <div style={{ position: "relative", height: "auto" }}>
      <Legend mapTopPos={mapContainerBottom} mapLeftPos={mapContainerRight} />
      {popupVisible && (
        <PopUp
          county={county}
          cursorX={cursorX}
          cursorY={cursorY}
          display={popupVisible}
          cases={cases}
        />
      )}
      <div className="data-box">
        <p>Longitude: {lng}</p>
        <p>Latitude: {lat}</p>
        <p style={{ marginRight: "50px" }}>Zoom: {zoom}</p>
        <p>
          Mouse Move:
          {mouseLocation.map((m, idx) => {
            if (mouseLocation.length !== idx + 1) {
              return " " + m + ", ";
            } else return m;
          })}{" "}
        </p>
        <p>County: {county}</p>
        <p>Cases: {cases ? cases.cases : 0}</p>
      </div>
      <DiseaseDropDown
        mapLeftPos={mapContainerLeft}
        mapTopPos={mapContainerBottom}
        disease={disease}
        setDisease={setDisease}
      />
      <div ref={mapContainer} id="map-container" className="map-container" />
    </div>
  );
};

const PopUp = ({ county, cursorX, cursorY, cases }) => {
  const style = {
    left: `${cursorX - (cases ? 80 : 60)}px`,
    top: `${cursorY - (cases ? 80 : 45)}px`,
    backgroundColor: "white",
    position: "absolute",
    padding: "10px",
    borderRadius: "10px",
  };
  return (
    <div style={{ position: "relative" }}>
      <div className="popup" style={style}>
        <span>{county}</span>
        {cases && <span>Cases: {cases.cases}</span>}
        {cases && <span>Disease: {cases.disease}</span>}
      </div>
    </div>
  );
};

const Legend = ({ mapTopPos, mapLeftPos }) => {
  const legendItems = [
    { thresholdColor: "#34dbe0", numberOfPeople: 0 },
    { thresholdColor: "#347ce0", numberOfPeople: 10000 },
    { thresholdColor: "#9f37db", numberOfPeople: 50000 },
    { thresholdColor: "#4d15a1", numberOfPeople: 100000 },
    { thresholdColor: "#2c0566", numberOfPeople: 200000 },
  ];
  return (
    <div
      className="legend-container"
      style={{
        // marginLeft: "80vw",
        // marginTop: "60vh",
        top: `${mapTopPos - 290}px`,
        left: `${mapLeftPos - 230}px`,
        width: "200px",
        // backgroundColor: "white",
        backgroundColor: "rgba(58, 58, 58, .6)",
        padding: "10px",
        color: "white",
        position: "absolute",
        border: "4px solid #9469d4",
      }}
    >
      <h3 style={{ textAlign: "center" }}>Disease Cases</h3>
      {legendItems.map((item, idx) => {
        return (
          <p key={`legend-p-item-${idx}`} style={{ paddingBottom: "5px" }}>
            <span
              key={`legend-span-item-${idx}`}
              style={{
                height: "5px",
                paddingTop: "1px",
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingBottom: "1px",
                borderRadius: "20px",
                backgroundColor: item.thresholdColor,
                margin: "10px",
              }}
            ></span>
            <span>{item.numberOfPeople}+</span>
          </p>
        );
      })}
    </div>
  );
};

const DiseaseDropDown = ({ mapLeftPos, mapTopPos, disease, setDisease }) => {
  const dropDownStyle = {
    width: "200px",
    textAlign: "center",
    position: "absolute",
    padding: "10px",
    backgroundColor: "#147eff",
    color: "white",
    top: `${mapTopPos - 50}px`,
    left: mapLeftPos,
  };
  console.log("mapTopPos", mapTopPos);
  return (
    <select
      value={disease}
      onChange={(e) => setDisease(e.target.value)}
      style={dropDownStyle}
    >
      {floridaCountyData.diseases.map((item, idx) => {
        return (
          <option style={{ textAlign: "center" }} value={item.disease}>
            {item.disease}
          </option>
        );
      })}
    </select>
  );
};

export default App;
