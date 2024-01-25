import React, { useRef, useEffect, useState } from "react";
import { getCountyMapData } from "../../api/get-counties-mapbox-data"; // Import function to fetch map data
import { getStateMapData } from "../../api/get-state-mapbox-data";
import { getDiseases } from "../../api/get-diseases"; // Import function to fetch diseases
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css"; // !Important for map styling
import { MapPopup, LeftPanel, RightPanel } from "."; // Import components for map display
const publicToken = require("../../tokens.json").publicToken; // Can exchange this for your own mapbox token
const diseases = await getDiseases(); // Await fetch function for diseases and set diseases to response
const countyData = await getCountyMapData(); // Await fetch function for map data and set mData to response
const countyMapData = countyData.data;
const stateGenPopulationTotal = countyMapData.features.reduce((acc, curr) => {
  return acc + curr.properties.genPopulation;
}, 0);

const stateData = await getStateMapData();
const stateMapData = stateData.data;

diseases.data.sort((a, b) => {
  let textA = a.disease_cases_key.toUpperCase();
  let textB = b.disease_cases_key.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
});

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
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCases, setSelectedCases] = useState({});
  const [selectedGenPop, setSelectedGenPop] = useState({});
  const [casesSwitch, setCasesSwitch] = useState(true);
  const [toggleState, setToggleState] = useState({});
  const [genPopSwitch, setGenPopSwitch] = useState(false);
  const [genPop, setGenPop] = useState({});
  useEffect(() => {
    setSelectedCases({});
    setSelectedGenPop({});
    setSelectedCounty("");
    setSelectedState("");
    const zoomThreshold = 4.7;
    setCases({});
    setGenPop({});
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
      // Add counties, state, gen-pop-county, gen-pop-state as sources, use countyMapData and stateMapData
      // as data and set type to geojson {
      map.addSource("counties", {
        type: "geojson",
        data: countyMapData,
      });

      map.addSource("state", {
        type: "geojson",
        data: stateMapData,
      });

      map.addSource("gen-pop-county", {
        type: "geojson",
        data: countyMapData,
      });

      map.addSource("gen-pop-state", {
        type: "geojson",
        data: stateMapData,
      });
      // }

      // If casesSwitch is set to true then add layers {
      casesSwitch &&
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
                0, // Set thresholds for colors based on numbers (this will look at
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
        ) &&
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
                0, // Set thresholds for colors based on numbers (this will look at
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
      // }
      // If genPop is set to true then add layers {
      genPopSwitch &&
        map.addLayer(
          {
            id: "gen-pop-county",
            type: "fill",
            minzoom: zoomThreshold, // !Important: Switches counties/state layer according to zoom level
            paint: {
              "fill-outline-color": "white",
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "genPopulation"], // Color Thresholds property
                0, // Set thresholds for colors based on numbers (this will look at
                "#f2ffa5", // the value of the genPopulation to set color when added to map)
                100000,
                "#c1f53f",
                200000,
                "#52cd19",
                300000,
                "#0a9518",
                4000000,
                "#084924",
                5000000,
                "#063a0b",
              ],
              "fill-opacity": 1,
            },
            source: "gen-pop-county",
          },
          "building"
        ) &&
        map.addLayer(
          {
            id: "gen-pop-state",
            type: "fill",
            maxzoom: zoomThreshold, // !Important: Switches counties/state layer according to zoom level
            paint: {
              "fill-outline-color": "white",
              "fill-color": [
                "interpolate",
                ["linear"],
                stateGenPopulationTotal, // Color Thresholds property
                0, // Set thresholds for colors based on numbers (this will look at
                "#f2ffa5", // the value of the genPopulation to set color when added to map)
                1000000,
                "#c1f53f",
                2000000,
                "#52cd19",
                3000000,
                "#0a9518",
                40000000,
                "#084924",
                50000000,
                "#063a0b",
              ],
              "fill-opacity": 1,
            },
            source: "gen-pop-state",
          },
          "building"
        );
      // }

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

      map.on("move", "gen-pop-county", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });

      map.on("move", "gen-pop-state", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });

      // When cursor enters boundaries in Florida set popupVisible to true and change cursor to a "pointer" from "grab" {
      map.on("mouseenter", "counties", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseenter", "state", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseenter", "gen-pop-county", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseenter", "gen-pop-state", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });
      // }

      // When the cursor is moving within county boundaries of Florida set cursorx and y, set county and set cases {
      map.on("mousemove", "counties", (e) => {
        setCases({});
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        setCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
        const diseaseCases = e.features[0].properties[`${disease}`]; // Set to value of current disease_cases_key
        // for the county the cursor is currently in. Used in Databox and MapPopup components
        const countiesCounty = e.features[0].properties.county;

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
            County: countiesCounty,
            Disease: disease_description,
            Cases: diseaseCases,
          };
        });
      });
      // }

      // When the cursor is moving within state boundaries of Florida set cursorx and y, set cases {
      map.on("mousemove", "state", (e) => {
        setCases({});
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        // setCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
        const diseaseCases = e.features[0].properties[`${disease}`]; // Set to value of current disease_cases_key
        // for the county the cursor is currently in. Used in Databox and MapPopup components
        const state = e.features[0].properties.state;

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
            State: state,
            Disease: disease_description,
            Cases: diseaseCases,
          };
        });
      });
      // }

      // When the cursor is moving within county boundaries of Florida set cursorx and y, set county and set genPop {
      map.on("mousemove", "gen-pop-county", (e) => {
        setGenPop({});
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        setCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
        const genPopCounty = e.features[0].properties.county;
        const genPopulation = e.features[0].properties["genPopulation"]; // Set to value of current genPopulation
        // for the county the cursor is currently in. Used in Databox and MapPopup components

        // Set cases to object with cases and disease
        setGenPop((gp) => {
          return {
            ...gp,
            County: genPopCounty,
            ["General Population"]: genPopulation,
          };
        });
      });
      // }

      // When the cursor is moving within state boundaries of Florida set cursorx and y, and set genPop {
      map.on("mousemove", "gen-pop-state", (e) => {
        setGenPop({});
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        // Set to state that the cursor is currently in
        const state = e.features[0].properties.state;

        // Set genPop to object with state and "General Population"
        setGenPop((gp) => {
          return {
            ...gp,
            State: state,
            ["General Population"]: stateGenPopulationTotal,
          };
        });
      });

      // When county is clicked set selectedCounty and set selectedCases {
      map.on("click", "counties", (e) => {
        setSelectedState("");
        setSelectedCounty(e.features[0].properties.county); // Set to county that is currently clicked
        const diseaseCases = e.features[0].properties[`${disease}`]; // Set to value of current disease_cases_key
        // for the county that is currently clicked. Used in MapPopup components

        // Set to object that has a diseas_cases_key value of the currently set disease in the diseases array
        const disease_data = diseases.data.filter(
          (d) => d.disease_cases_key === disease
        );
        const disease_description = disease_data[0].disease_description; // Grab disease description from disease data. Used
        // in MapPopup component.

        // Set cases to object with cases and disease
        setSelectedCases((c) => {
          return {
            ...c,
            Disease: disease_description,
            Cases: diseaseCases,
          };
        });
      });
      // }

      // When state is clicked set selectedState and set selectedCases {
      map.on("click", "state", (e) => {
        setCases({});
        setSelectedCounty("");
        setSelectedState(e.features[0].properties.state);
        setCursorX(e.point.x);
        setCursorY(e.point.y);
        const diseaseCases = e.features[0].properties[`${disease}`]; // Set to value of current disease_cases_key
        // for the county the cursor is currently in. Used in Databox and MapPopup components

        // Set to object that has a diseas_cases_key value of the currently set disease in the diseases array
        const disease_data = diseases.data.filter(
          (d) => d.disease_cases_key === disease
        );
        const disease_description = disease_data[0].disease_description; // Grab disease description from disease data. Used
        // in MapPopup component.

        // Set cases to object with cases and disease
        setSelectedCases((c) => {
          return {
            ...c,
            Disease: disease_description,
            Cases: diseaseCases,
          };
        });
      });
      // }

      // When county is clicked set selectedCounty and set selectedGenPop {
      map.on("click", "gen-pop-county", (e) => {
        setSelectedCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
        const genPopulation = e.features[0].properties["genPopulation"]; // Set to value of current disease_cases_key
        // for the county the cursor is currently in. Used in Databox and MapPopup components

        // Set selectedGenPop to object with General Population
        setSelectedGenPop((c) => {
          return {
            ...c,
            ["General Population"]: genPopulation,
            components: [
              <p style={{ color: "white" }} key={"test-comp-key-1"}>
                Test Component 1
              </p>,
              <p style={{ color: "white" }} key={"test-comp-key-2"}>
                Test Component 2
              </p>,
            ],
          };
        });
      });
      // }

      // When state is clicked set selectedState and set selectedGenPop {
      map.on("click", "gen-pop-state", (e) => {
        setSelectedCounty("");
        setSelectedState(e.features[0].properties.state); // Set to value of current state that has been clicked
        // MapPopup components

        // Set selectedGenPop to object with General Population
        setSelectedGenPop((c) => {
          return {
            ...c,
            ["General Population"]: stateGenPopulationTotal,
            components: [
              <p style={{ color: "white" }} key={"test-comp-key-1"}>
                Test Component 1
              </p>,
              <p style={{ color: "white" }} key={"test-comp-key-2"}>
                Test Component 2
              </p>,
            ],
          };
        });
      });
      // }

      // When mouse leaves boundaries set popupVisible to false and set cursor back to "grab" from "pointer"
      map.on("mouseleave", "counties", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
      map.on("mouseleave", "state", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
      map.on("mouseleave", "gen-pop-county", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
      map.on("mouseleave", "gen-pop-state", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
    });

    // Unmount map
    return () => map.remove();
  }, [disease, casesSwitch, genPopSwitch]);

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
  const countyLegendItems = [
    { thresholdColor: "#ebebeb", numberOfPeople: 0 },
    { thresholdColor: "#34dbe0", numberOfPeople: 100 },
    { thresholdColor: "#347ce0", numberOfPeople: 10000 },
    { thresholdColor: "#9f37db", numberOfPeople: 50000 },
    { thresholdColor: "#4d15a1", numberOfPeople: 100000 },
    { thresholdColor: "#2c0566", numberOfPeople: 200000 },
  ];
  const stateLegendItems = [
    { thresholdColor: "#ebebeb", numberOfPeople: 0 },
    { thresholdColor: "#34dbe0", numberOfPeople: 1000000 },
    { thresholdColor: "#347ce0", numberOfPeople: 2000000 },
    { thresholdColor: "#9f37db", numberOfPeople: 4000000 },
    { thresholdColor: "#4d15a1", numberOfPeople: 6000000 },
    { thresholdColor: "#2c0566", numberOfPeople: 8000000 },
  ];

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <>
        <LeftPanel
          zoom={zoom}
          disease={disease}
          diseases={diseases}
          setDisease={setDisease}
          casesSwitch={casesSwitch}
          setCasesSwitch={setCasesSwitch}
          genPopSwitch={genPopSwitch}
          setGenPopSwitch={setGenPopSwitch}
          toggleState={toggleState}
          setToggleState={setToggleState}
        />
        {casesSwitch && (
          <RightPanel
            title={
              selectedCounty
                ? `${selectedCounty} Case Statistics`
                : selectedState && `${selectedState} Case Statistics`
            }
            rightPanelInfo={selectedCases} // Expects an object. This can contain an array property "components"
            // with an array of components for display in right panel.
          />
        )}
        {genPopSwitch && (
          <RightPanel
            title={
              selectedCounty
                ? `${selectedCounty} General Population Statistics`
                : selectedState &&
                  `${selectedState} General Population Statistics`
            }
            rightPanelInfo={selectedGenPop} // Expects an object. This can contain an array property "components"
            // with an array of components for display in right panel.
          />
        )}
        {popupVisible && Object.keys(cases).length > 0 && (
          <MapPopup
            // county={county}
            cursorX={cursorX}
            cursorY={cursorY}
            display={popupVisible}
            popupValuesObj={cases} // Expects an object
          />
        )}
        {popupVisible && Object.keys(genPop).length > 0 && (
          <MapPopup
            // county={county}
            cursorX={cursorX}
            cursorY={cursorY}
            display={popupVisible}
            popupValuesObj={genPop} // Expects an object
          />
        )}
        <div ref={mapContainer} id="map-container" className="map-container" />
      </>
    </div>
  );
};
