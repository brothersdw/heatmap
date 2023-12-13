import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { motion } from "framer-motion";
const publicToken = require("./tokens.json").publicToken;
const floridaData = require("./florida-data.json");
mapboxgl.accessToken = publicToken;

const App = () => {
  const thresholds = {
    property: "population",
    stops: [
      [0, "#34dbe0"],
      [10000, "#347ce0"],
      [50000, "#9f37db"],
      [100000, "#4d15a1"],
      [200000, "#2c0566"],
    ],
  };
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-83.75357);
  const [lat, setLat] = useState(27.791858);
  const [mouseLocation, setMouseLocation] = useState([]);
  const [zoom, setZoom] = useState(5);
  const [county, setCounty] = useState();
  const [cursorX, setCursorX] = useState();
  const [cursorY, setCursorY] = useState();
  const [popupVisible, setPopupVisible] = useState(false);
  const [cases, setCases] = useState(0);
  const getRandomColor = () => {
    return `#${Math.random().toString(16).substring(2, 8)}`;
  };

  const randomColors = getRandomColor();
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("load", () => {
      console.log("randomcolors: ", randomColors);
      map.current.addSource("counties", {
        type: "vector",
        url: "mapbox://mapbox.82pkq93d",
      });

      map.current.addLayer(
        {
          id: "counties",
          type: "fill",
          source: "counties",
          "source-layer": "original",
          paint: {
            "fill-outline-color": "rgba(93,0,213,0.8)",
            "fill-color": "gray",
            "fill-opacity": 0.8,
          },
        },
        // before the `building` layer that is in the map from the Mapbox
        "building"
      );

      map.current.setPaintProperty("counties", "fill-color", {
        property: thresholds.property,
        stops: thresholds.stops,
      });

      map.current.on("move", () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });
      map.current.on("mouseenter", "counties", (e) => {
        setPopupVisible(true);
      });
      map.current.on("mousemove", "counties", (e) => {
        map.current.getCanvas().style.cursor = "pointer";

        setCursorX(e.point.x);
        setCursorY(e.point.y);

        if (e.features.length > 0) {
          const feature = e.features[0];
          const casesFound = floridaData.filter(
            (d) => d.county === feature.properties.COUNTY
          )[0];
          if (casesFound) {
            setCases((c) => casesFound);
          } else {
            setCases();
          }
          const yourX = feature.properties.COUNTY;
          const countyLngLat = [
            e.lngLat.lng.toFixed(4),
            e.lngLat.lat.toFixed(4),
          ];
          setMouseLocation(countyLngLat);
          setCounty(feature.properties.COUNTY);
        }
      });

      map.current.on("click", "counties", (e) => {
        console.log("Event Data: ", e.features);
      });
      map.current.on("mouseleave", "counties", () => {
        map.current.getCanvas().style.cursor = "";
        setPopupVisible(false);
      });
    });
  });

  return (
    <div>
      <Legend />
      {popupVisible && (
        <>
          <PopUp
            county={county}
            cursorX={cursorX}
            cursorY={cursorY}
            display={popupVisible}
            cases={cases}
          />
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
        </>
      )}
      <div ref={mapContainer} className="map-container" />
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

const Legend = () => {
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
        marginLeft: "80vw",
        marginTop: "60vh",
        width: "200px",
        backgroundColor: "white",
        padding: "10px",
        position: "absolute",
      }}
    >
      <p>Population</p>
      {legendItems.map((item) => {
        return (
          <p>
            <span
              style={{
                height: "5px",
                padding: "5px",
                borderRadius: "20px",
                backgroundColor: item.thresholdColor,
                margin: "10px",
              }}
            ></span>
            <span>{item.numberOfPeople}</span>
          </p>
        );
      })}
    </div>
  );
};

export default App;
