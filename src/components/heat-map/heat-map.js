import React, { useRef, useEffect, useState } from "react";
import { getCountyMapData } from "../../api/get-counties-mapbox-data"; // Import function to fetch map data
import { getStateMapData } from "../../api/get-state-mapbox-data";
import { getDiseases } from "../../api/get-diseases"; // Import function to fetch diseases
import { getMapLineGraphData } from "../../api/get-map-line-graph-data";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css"; // !Important for map styling
import {
  MapPopup,
  LeftPanel,
  RightPanel,
  addMapLayer,
  friendlyNumber,
  LoadingScreen,
} from "."; // Import components for map display
const mapLayers = require("./mapLayers.json"); // import mapLayers json for object reference.
// Set layer objects for map layers
const countiesLayerProperties = mapLayers.countiesLayerProperties;
const stateLayerProperties = mapLayers.stateLayerProperties;
const genPopCountyLayerProperties = mapLayers.genPopCountyLayerProperties;
const genPopStateLayerProperties = mapLayers.genPopStateLayerProperties;
const genPopPerCountyLayerProperties = mapLayers.genPopPerCountyLayerProperties;
const genPopPerStateLayerProperties = mapLayers.genPopPerStateLayerProperties;
const allStatesLineProperties = mapLayers.allStatesLineProperties;
const allStatesFillProperties = mapLayers.allStatesFillProperties;
const publicToken = require("../../tokens.json").publicToken; // Can exchange this for your own mapbox token
const diseases = await getDiseases(); // Await fetch function for diseases and set diseases to response
const date = new Date();
const dateToISOString = new Date(date.setDate(date.getDate())).toISOString();
const currentDayStart = dateToISOString.split("T")[0];
const currentDayEnd = dateToISOString.split("T")[0];
const getAllStateBoundaries = await getStateMapData();
const allStateBoundaries = getAllStateBoundaries.data;
// const countyData = await getCountyMapData("FL", currentDayStart); // Await fetch function for map data and set mData to response
// // const countyMapData = countyData.data;
// const stateData = await getStateMapData("FL");
// const stateMapData = stateData.data;

diseases.data.sort((a, b) => {
  let textA = a.disease_cases_key.toUpperCase();
  let textB = b.disease_cases_key.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
});

const getRandomColor = () => {
  return `#${Math.random().toString(16).substring(2, 10)}`;
};

mapboxgl.accessToken = publicToken; // !Important you have to have this or you will not be able display the map

export const HeatMap = () => {
  const [countyMapData, setCountyMapData] = useState({});
  const [stateMapData, setStateMapData] = useState({});
  const [usState, setUsState] = useState(["fl", "ga"]);
  const [graphData, setGraphData] = useState([]);
  const [currentUsState, setCurrentUsState] = useState();
  const [selectedCounty, setSelectedCounty] = useState(""); // Selected county for info panel display
  const [selectedState, setSelectedState] = useState(""); // Selected state for info panel display
  const [selectedCases, setSelectedCases] = useState({}); // Selected cases for info panel display
  const [selectedGenPop, setSelectedGenPop] = useState({}); // Selected gen pop for info panel display
  const [selectedGenPopPer, setSelectedGenPopPer] = useState({}); // Selected gen pop percentage for info panel display
  // let countyData;
  // let stateData;
  // let stateMapData;
  useEffect(() => {
    const setData = async () => {
      const countyData = await getCountyMapData(usState, currentDayStart); // Await fetch function for map data and set mData to response
      // const countyMapData = countyData.data;
      const stateData = await getStateMapData(usState);
      const stateMapData = stateData.data;
      setCountyMapData((c) => countyData.data);
      setStateMapData((s) => stateMapData);
    };
    setData();
  }, [usState]);
  const mapContainer = useRef(null);
  // const [map, setMap] = useState(null);
  // const [countyMapData, setCountyMapData] = useState(countyData.data);
  const [lng, setLng] = useState(-83.75357); // Set default lng, lat to center on Florida. Also used for DataBox component display
  const [lat, setLat] = useState(27.791858);
  const [zoom, setZoom] = useState(5); // This will be used to set boundary state
  const [cursorX, setCursorX] = useState(); // Grabs the x position of the cursor for the MapPopup component
  const [cursorY, setCursorY] = useState(); // Grabs the y position of the cursor for the MapPopup component
  const [popupVisible, setPopupVisible] = useState(false); // Controls visible state of MapPopup
  const [cases, setCases] = useState({}); // Controls number of cases displayed in MapPopup and DataBox components as well as disease description in MapPopup
  const [disease, setDisease] = useState(diseases.data[0].disease_cases_key); // Controls the current disease that is chosen
  const [caseInfoSwitch, setCaseInfoSwitch] = useState(true);
  const [casesSwitch, setCasesSwitch] = useState(true); // State for cases toggle switch
  const [toggleState, setToggleState] = useState({}); // toggleState for toggle switch
  const [genPopSwitch, setGenPopSwitch] = useState(false); // State for genPop toggle switch
  const [genPopPerSwitch, setGenPopPerSwitch] = useState(false); // State for genPop percentage toggle switch
  const [compareSwitch, setCompareSwitch] = useState(false); // State for compareSwitch toggle switch
  const [genPop, setGenPop] = useState({}); // Controls what is displayed in the popup for genPop statistics
  const [genPopPer, setGenPopPer] = useState({}); // Controls what is displayed in the popup for genPop statistics
  const [rightPanelStartDate, setRightPanelStartDate] =
    useState(currentDayStart); // State for start date of date picker in right panel this will be used for graphs
  const [rightPanelEndDate, setRightPanelEndDate] = useState(currentDayEnd); // State for start date of date picker in
  // right panel this will be used for graphs
  const [leftPanelDate, setLeftPanelDate] = useState(currentDayStart); // State for start date of date picker in left panel
  // this is used to show heatmap and cases for a specific date
  const [isLoading, setIsLoading] = useState(true);
  const [popupString, setPopupString] = useState("");
  const initialMapObj = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { a1: "" },
        // geometry: { type: "Polygon", coordinates: [[]] },
        geometry: null,
      },
    ],
  };
  useEffect(() => {
    setIsLoading(true);
    const stateGenPopulationTotal = countyMapData?.features?.map((feature) => {
      return {
        state_ab: feature[0].properties.state_ab,
        genPop: feature.reduce(
          // Summing all county populations for state population
          (acc, curr) => {
            return acc + curr.properties.genPopulation;
          },
          0
        ),
      };
    });
    let countyCount = 0;
    const countyCounts = countyMapData?.features?.map((c) => {
      return {
        state_ab: c[0].properties.state_ab,
        countyCount: c.map((cc) => cc).length,
      };
    });
    const stateGenPopulationPerSumTotal = countyMapData?.features?.map(
      (feature) => {
        return {
          state_ab: feature[0].properties.state_ab,
          genPopPer: feature.reduce((acc, curr) => {
            return acc + curr.properties[`${disease}_cases_percentage`];
          }, 0),
        };
      }
    );

    const stateGenPopulationPerTotal = stateGenPopulationPerSumTotal?.map(
      (statePer) => {
        const statePercent =
          statePer.genPopPer /
          countyCounts.filter((c) => c.state_ab === statePer.state_ab)[0]
            .countyCount;
        return {
          state_ab: statePer.state_ab,
          percentage: statePercent,
        };
      }
    );

    // console.log("state GenPOp total:", stateGenPopulationTotal);
    // console.log("county counts:", countyCounts);
    // console.log("state GenPopPer total:", stateGenPopulationPerSumTotal);
    // console.log("state GenPopPerTotal total:", stateGenPopulationPerTotal);
    // console.log("county data:", countyMapData);
    // Reset states
    setSelectedCases({});
    setSelectedGenPop({});
    setSelectedGenPopPer({});
    setSelectedCounty("");
    setSelectedState("");
    setCases({});
    setGenPop({});
    setGenPopPer({});

    // Create map
    const map = new mapboxgl.Map({
      container: mapContainer?.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
      projection: "globe",
    });

    const addMapSource = (sourceName = "", dataType = "", dataObj = {}) => {
      // function to add map sources
      map?.addSource(sourceName, {
        type: dataType,
        data: typeof dataObj !== "undefined" ? dataObj : initialMapObj,
        // testData,
      });
    };
    // Map on load event
    map.on("load", (e) => {
      // Add map sources {

      addMapSource("all-states", "geojson", allStateBoundaries);

      map.addLayer(
        addMapLayer(
          allStatesLineProperties,
          "",
          "none",
          false,
          false,
          "line",
          "white"
        )
      );
      map.addLayer(
        addMapLayer(
          allStatesFillProperties,
          "",
          "none",
          false,
          false,
          "fill",
          "transparent"
        )
      );

      map.on("mouseenter", "all-states-fill", (e) => {
        setPopupVisible(true);
        setPopupString("Click state to view data");
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mousemove", "all-states-fill", (e) => {
        setGenPop({});
        setCases({});
        setGenPopPer({});
        setPopupString("Click to view state data");
        setCursorX(e.point.x);
        setCursorY(e.point.y);
      });

      map.on("click", "all-states-fill", (e) => {
        // console.log(e.features[0].properties.state_ab);
        // console.log(
        //   "state bool:",
        //   String(usState).toUpperCase() !==
        //     String(e.features[0].properties.state_ab).toUpperCase()
        // );
        // if (usState.length > 1) {
        // const state_ab = e.features[0].properties.state_ab;
        // setUsState((s) => [...s, state_ab]);
        // console.log(usState);
        // }
        // if (usState.length === 1) {
        //   console.log("usState:", usState);
        // console.log("heatmap features:", e.features);
        const stateChosen = usState.filter(
          (s, idx) =>
            String(s).toUpperCase() ===
            String(e.features[0].properties.state_ab).toUpperCase()
        ).length;
        // stateChosen;
        const currentState_ab = String(
          e.features[0].properties.state_ab
        ).toUpperCase();
        // console.log("state chosen:", stateChosen);
        !stateChosen && setUsState((s) => [...s, currentState_ab]);
        // console.log("state_ab:", e.features[0].properties.state_ab);
        // }
        // console.log("usStates:", usState);
      });

      map.on("mouseleave", "all-states-fill", (e) => {
        setPopupVisible(false);
        setPopupString();
        map.getCanvas().style.cursor = "grab";
      });
      countyMapData &&
        usState.map((uss, idx) => {
          // countyMapData?.features?.length > 0 &&
          // console.log("county map feature:", countyMapData.features[idx]);
          const currentCountyMapData = {
            type: countyMapData?.type,
            features:
              countyMapData?.features?.length > 0 &&
              countyMapData?.features[idx],
          };
          addMapSource(`counties-${idx}`, "geojson", currentCountyMapData);
          addMapSource(`state-${idx}`, "geojson", stateMapData);
          addMapSource(
            `gen-pop-county-${idx}`,
            "geojson",
            currentCountyMapData
          );
          addMapSource(`gen-pop-state-${idx}`, "geojson", stateMapData);
          addMapSource(
            `gen-pop-per-county-${idx}`,
            "geojson",
            countyMapData[idx]
          );
          addMapSource(`gen-pop-per-state-${idx}`, "geojson", stateMapData);
          //}

          // Adding map layers conditionally {
          const countyLayer = countiesLayerProperties;
          countyLayer.id = `counties-${idx + 1}`;
          countyLayer.source = `counties-${idx + 1}`;
          countiesLayerProperties.id = `counties-${idx}`;

          // console.log("county layer properties:", countyLayer);
          countiesLayerProperties.source = `counties-${idx}`;
          stateLayerProperties.id = `state-${idx}`;
          stateLayerProperties.source = `state-${idx}`;
          // console.log("index:", idx);
          casesSwitch &&
            map.addLayer(
              addMapLayer(countiesLayerProperties, disease, "minzoom"),
              "building"
            ) &&
            map.addLayer(
              addMapLayer(stateLayerProperties, disease, "maxzoom"),
              "building"
            );

          genPopSwitch &&
            map.addLayer(
              addMapLayer(
                genPopCountyLayerProperties,
                "genPopulation",
                "minzoom"
              ),
              "building"
            ) &&
            map.addLayer(
              addMapLayer(
                genPopStateLayerProperties,
                stateGenPopulationTotal,
                "maxzoom",
                false
              ),
              "building"
            );
          genPopPerSwitch &&
            map.addLayer(
              addMapLayer(
                genPopPerCountyLayerProperties,
                `${disease}_cases_percentage`,
                "minzoom"
              ),
              "building"
            ) &&
            map.addLayer(
              addMapLayer(
                genPopPerStateLayerProperties,
                stateGenPopulationPerTotal,
                "maxzoom",
                false
              ),
              "building"
            );
          // }

          // When the map is moved (e.g. grabbed and rotated, zoom out, zoom in, etc...) set lng and lat
          // to current value with fixed decimal figure of 4 and set zoom to current zoom with fixed decimal figure of 2 {
          map.on("move", `counties-${idx}`, () => {
            setLng(map.getCenter().lng.toFixed(4));
            setLat(map.getCenter().lat.toFixed(4));
            setZoom(map.getZoom().toFixed(2));
          });
          map.on("move", `state-${idx}`, () => {
            setLng(map.getCenter().lng.toFixed(4));
            setLat(map.getCenter().lat.toFixed(4));
            setZoom(map.getZoom().toFixed(2));
          });

          map.on("move", `gen-pop-county-${idx}`, () => {
            setLng(map.getCenter().lng.toFixed(4));
            setLat(map.getCenter().lat.toFixed(4));
            setZoom(map.getZoom().toFixed(2));
          });

          map.on("move", `gen-pop-state-${idx}`, () => {
            setLng(map.getCenter().lng.toFixed(4));
            setLat(map.getCenter().lat.toFixed(4));
            setZoom(map.getZoom().toFixed(2));
          });

          map.on("move", `gen-pop-per-county-${idx}`, () => {
            setLng(map.getCenter().lng.toFixed(4));
            setLat(map.getCenter().lat.toFixed(4));
            setZoom(map.getZoom().toFixed(2));
          });

          map.on("move", `gen-pop-per-state-${idx}`, () => {
            setLng(map.getCenter().lng.toFixed(4));
            setLat(map.getCenter().lat.toFixed(4));
            setZoom(map.getZoom().toFixed(2));
          });
          // }

          // When cursor enters boundaries set popupVisible to true and change cursor to a "pointer" from "grab" {

          map.on("mouseenter", `counties-${idx}`, (e) => {
            setPopupVisible(true);
            setPopupString();
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mouseenter", `state-${idx}`, (e) => {
            setPopupVisible(true);
            setPopupString();
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mouseenter", `gen-pop-county-${idx}`, (e) => {
            setPopupVisible(true);
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mouseenter", `gen-pop-state-${idx}`, (e) => {
            setPopupVisible(true);
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseenter", `gen-pop-per-county-${idx}`, (e) => {
            setPopupVisible(true);
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseenter", `gen-pop-per-state-${idx}`, (e) => {
            setPopupVisible(true);
            map.getCanvas().style.cursor = "pointer";
          });
          // }

          // When the cursor is moving within boundaries of Florida set cursorx and y, set county and set cases for each layer
          // {

          map.on("mousemove", `counties-${idx}`, (e) => {
            setCases({});
            setPopupString();
            setCursorX(e.point.x);
            setCursorY(e.point.y);

            const diseaseCases = e.features[0].properties[`${disease}`]; // Set to value of current disease_cases_key
            // for the county the cursor is currently in. Used in Databox and MapPopup components
            const countiesCounty = e.features[0].properties.county;

            // Set to object that has a diseas_cases_key value of the currently set disease in the diseases array
            const disease_data = diseases.data.filter(
              (d) => d.disease_cases_key === disease
            );
            const disease_description = disease_data[0].disease_description; // Grab disease description from disease data. Used
            // in MapPopup component.
            // const numOfCases = friendlyNumber(diseaseCases);
            // Set cases to object with cases and disease
            setCases((c) => {
              return {
                ...c,
                County: countiesCounty,
                Disease: disease_description,
                Cases: friendlyNumber(diseaseCases),
              };
            });
          });

          map.on("mousemove", `state-${idx}`, (e) => {
            setCases({});
            setPopupString();
            setCursorX(e.point.x);
            setCursorY(e.point.y);

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
                Cases: friendlyNumber(diseaseCases),
              };
            });
          });

          map.on("mousemove", `gen-pop-county-${idx}`, (e) => {
            setGenPop({});
            setPopupString();
            setCursorX(e.point.x);
            setCursorY(e.point.y);

            const genPopCounty = e.features[0].properties.county;
            const genPopulation = e.features[0].properties["genPopulation"]; // Set to value of current genPopulation
            // for the county the cursor is currently in. Used in Databox and MapPopup components

            // Set cases to object with cases and disease
            setGenPop((gp) => {
              return {
                ...gp,
                County: genPopCounty,
                "General Population": friendlyNumber(genPopulation),
              };
            });
          });

          map.on("mousemove", `gen-pop-state-${idx}`, (e) => {
            setGenPop({});
            setPopupString();
            setCursorX(e.point.x);
            setCursorY(e.point.y);
            // Set to state that the cursor is currently in
            const state = e.features[0].properties.state;

            // Set genPop to object with state and "General Population"
            setGenPop((gp) => {
              return {
                ...gp,
                State: state,
                "General Population": friendlyNumber(stateGenPopulationTotal),
              };
            });
          });

          // When the cursor is moving within county boundaries of Florida set cursorx and y, set county and set genPop {
          map.on("mousemove", `gen-pop-per-county-${idx}`, (e) => {
            setGenPop({});
            setPopupString();
            setCursorX(e.point.x);
            setCursorY(e.point.y);

            const genPopPerCounty = e.features[0].properties.county;
            // const genPopulationPer =
            //   e.features[0].properties[`${disease}_cases_percentage`]; // Set to value of current genPopulation
            // // for the county the cursor is currently in. Used in Databox and MapPopup components

            const disease_data = diseases.data.filter(
              (d) => d.disease_cases_key === disease
            );
            const disease_description = disease_data[0].disease_description;
            const genPopulationPer =
              (e.features[0].properties[`${disease}`] /
                e.features[0].properties["genPopulation"]) *
              100;

            // Set cases to object with cases and disease
            setGenPopPer((gp) => {
              return {
                ...gp,
                County: genPopPerCounty,
                Disease: disease_description,
                "Case Percentage of Population": `${genPopulationPer.toFixed(
                  2
                )}%`,
              };
            });
          });

          map.on("mousemove", `gen-pop-per-state-${idx}`, (e) => {
            setGenPopPer({});
            setPopupString();
            setCursorX(e.point.x);
            setCursorY(e.point.y);
            // Set to state that the cursor is currently in
            const state = e.features[0].properties.state;
            const disease_data = diseases.data.filter(
              (d) => d.disease_cases_key === disease
            );
            const disease_description = disease_data[0].disease_description;

            // Set genPop to object with state and "General Population"
            setGenPopPer((gp) => {
              return {
                ...gp,
                State: state,
                Disease: disease_description,
                "Case Percentage of Population": `${stateGenPopulationPerTotal.toFixed(
                  2
                )}%`,
              };
            });
          });

          // When county is clicked set selectedCounty and set selectedCases {

          map.on("click", `counties-${idx}`, async (e) => {
            setSelectedState("");
            setSelectedCounty(e.features[0].properties.county); // Set to county that is currently clicked
            setCurrentUsState(e.features[0].properties.state_ab);
            console.log("current state1:", e.features[0].properties.state_ab);
            const diseaseCases = e.features[0].properties[`${disease}`]; // Set to value of current disease_cases_key
            // for the county that is currently clicked. Used in MapPopup components

            // Set to object that has a diseas_cases_key value of the currently set disease in the diseases array
            const disease_data = diseases.data.filter(
              (d) => d.disease_cases_key === disease
            );
            const disease_description = disease_data[0].disease_description; // Grab disease description from disease data. Used
            // in MapPopup component.
            // Set cases to object with cases and disease
            const currentState = e.features[0].properties.state_ab;
            const currentCounty = e.features[0].properties.county;

            setSelectedCases((c) => {
              return {
                ...c,
                Disease: disease_description,
                Cases: friendlyNumber(diseaseCases),
              };
            });
          });
          // }

          // When boundary in layer is clicked set selectedState and set selectedCases {
          map.on("click", `state-${idx}`, (e) => {
            setCases({});
            setSelectedCounty("");
            setSelectedState(e.features[0].properties.state);
            setCurrentUsState(e.features[0].properties.state_ab);
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
                Cases: friendlyNumber(diseaseCases),
              };
            });
          });

          map.on("click", `gen-pop-county-${idx}`, (e) => {
            setSelectedCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
            const genPopulation = e.features[0].properties["genPopulation"]; // Set to value of current disease_cases_key
            // for the county the cursor is currently in. Used in Databox and MapPopup components

            setCurrentUsState(e.features[0].properties.state_ab);

            // Set selectedGenPop to object with General Population
            setSelectedGenPop((c) => {
              return {
                ...c,
                "General Population": friendlyNumber(genPopulation),
              };
            });
          });

          map.on("click", `gen-pop-state-${idx}`, (e) => {
            setSelectedCounty("");
            setSelectedState(e.features[0].properties.state); // Set to value of current state that has been clicked
            // MapPopup components

            setCurrentUsState(e.features[0].properties.state_ab);

            // Set selectedGenPop to object with General Population
            setSelectedGenPop((c) => {
              return {
                ...c,
                "General Population": friendlyNumber(stateGenPopulationTotal),
              };
            });
          });

          map.on("click", `gen-pop-per-county-${idx}`, (e) => {
            setSelectedGenPopPer({});
            setSelectedCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
            setCurrentUsState(e.features[0].properties.state_ab);
            const disease_data = diseases.data.filter(
              (d) => d.disease_cases_key === disease
            );
            const disease_description = disease_data[0].disease_description;
            const genPopulationPer =
              e.features[0].properties[`${disease}_cases_percentage`]; // Set to value of current disease_cases_key
            // for the county the cursor is currently in. Used in Databox and MapPopup components

            // Set selectedGenPop to object with General Population
            setSelectedGenPopPer((c) => {
              return {
                ...c,
                Disease: disease_description,
                "Case Percentage of Population": `${genPopulationPer.toFixed(
                  2
                )}%`,
              };
            });
          });

          map.on("click", `gen-pop-per-state-${idx}`, (e) => {
            setSelectedGenPopPer({});
            setSelectedCounty("");
            setSelectedState(e.features[0].properties.state); // Set to value of current state that has been clicked
            // MapPopup components
            setCurrentUsState(e.features[0].properties.state_ab);

            // Set to object that has a diseas_cases_key value of the currently set disease in the diseases array
            const disease_data = diseases.data.filter(
              (d) => d.disease_cases_key === disease
            );
            const disease_description = disease_data[0].disease_description; // Grab disease description from disease data. Used
            // in MapPopup component.

            // Set selectedGenPop to object with General Population
            setSelectedGenPopPer((c) => {
              return {
                ...c,
                Disease: disease_description,
                "Case Percentage of Population": `${stateGenPopulationPerTotal.toFixed(
                  2
                )}%`,
              };
            });
          });
          // }

          // When mouse leaves boundaries set popupVisible to false and set cursor back to "grab" from "pointer"
          map.on("mouseleave", `counties-${idx}`, () => {
            setPopupVisible(false);
            // map.getCanvas().style.cursor = "grab";
          });
          map.on("mouseleave", `state-${idx}`, () => {
            setPopupVisible(false);
            // map.getCanvas().style.cursor = "grab";
          });
          map.on("mouseleave", `gen-pop-county-${idx}`, () => {
            setPopupVisible(false);
            // map.getCanvas().style.cursor = "grab";
          });
          map.on("mouseleave", `gen-pop-state-${idx}`, () => {
            setPopupVisible(false);
            // map.getCanvas().style.cursor = "grab";
          });
          map.on("mouseleave", `gen-pop-per-county-${idx}`, () => {
            setPopupVisible(false);
            // map.getCanvas().style.cursor = "grab";
          });
          map.on("mouseleave", `gen-pop-per-state-${idx}`, () => {
            setPopupVisible(false);
            // map.getCanvas().style.cursor = "grab";
          });
        });
    });
    // console.log("isLoading:", isLoading);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    // Unmount map
    return () => map.remove();
  }, [disease, casesSwitch, genPopSwitch, genPopPerSwitch, countyMapData]);

  return (
    <div>
      <>
        <LeftPanel
          zoom={zoom}
          disease={disease}
          diseases={diseases}
          setDisease={setDisease}
          caseInfoSwitch={caseInfoSwitch}
          setCaseInfoSwitch={setCaseInfoSwitch}
          casesSwitch={casesSwitch}
          setCasesSwitch={setCasesSwitch}
          genPopSwitch={genPopSwitch}
          setGenPopSwitch={setGenPopSwitch}
          genPopPerSwitch={genPopPerSwitch}
          setGenPopPerSwitch={setGenPopPerSwitch}
          compareSwitch={compareSwitch}
          setCompareSwitch={setCompareSwitch}
          toggleState={toggleState}
          setToggleState={setToggleState}
          leftPanelDate={leftPanelDate}
          setLeftPanelDate={setLeftPanelDate}
          setData1={setCountyMapData}
          state={usState}
        />
        {casesSwitch && ( // Display if casesSwitch is set to true
          <RightPanel
            title={
              selectedCounty
                ? `${selectedCounty} Case Statistics`
                : selectedState && `${selectedState} Case Statistics`
            }
            currentSwitch={"cases"}
            disease={disease}
            county={selectedCounty}
            rightPanelInfo={selectedCases} // Object with properties to display in right panel
            rightPanelStartDate={rightPanelStartDate} // Date picker start date
            rightPanelEndDate={rightPanelEndDate} // Date picker end date
            setRightPanelStartDate={setRightPanelStartDate} // Set date picker start date
            setRightPanelEndDate={setRightPanelEndDate} // Set date picker end date
            state={usState}
            selectedState={selectedState}
            currentUsState={currentUsState}
          />
        )}
        {genPopSwitch && ( // Display if genPopSwitch is set to true
          <RightPanel
            title={
              selectedCounty
                ? `${selectedCounty} General Population Statistics`
                : selectedState &&
                  `${selectedState} General Population Statistics`
            }
            countyMapData={countyMapData}
            currentSwitch={"genPop"}
            county={selectedCounty}
            disease={disease}
            rightPanelInfo={selectedGenPop}
            rightPanelStartDate={rightPanelStartDate}
            rightPanelEndDate={rightPanelEndDate}
            setRightPanelStartDate={setRightPanelStartDate}
            setRightPanelEndDate={setRightPanelEndDate}
            state={usState}
            selectedState={selectedState}
            currentUsState={currentUsState}
          />
        )}
        {genPopPerSwitch && ( // Display if genPopSwitch is set to true
          <RightPanel
            title={
              selectedCounty
                ? `${selectedCounty} General Population Percentage Statistics`
                : selectedState &&
                  `${selectedState} General Population Percentage Statistics`
            }
            countyMapData={countyMapData}
            currentSwitch={"genPopPer"}
            county={selectedCounty}
            disease={disease}
            rightPanelInfo={selectedGenPopPer}
            rightPanelStartDate={rightPanelStartDate}
            rightPanelEndDate={rightPanelEndDate}
            setRightPanelStartDate={setRightPanelStartDate}
            setRightPanelEndDate={setRightPanelEndDate}
            state={usState}
            currentUsState={currentUsState}
          />
        )}
        {popupVisible &&
          Object.keys(cases).length > 0 && ( // Show map popup if popupVisible is set to true and properties
            // exist in cases
            <MapPopup
              cursorX={cursorX} // cursorX tracks movement of mouse on the X axis to allow popup to follow mouse
              cursorY={cursorY} // cursorY tracks movement of mouse on the Y axis to allow popup to follow mouse
              display={popupVisible} // Boolean to determine when popup is visible
              popupValuesObj={cases} // Object with properties for popup to display
            />
          )}
        {popupVisible &&
          Object.keys(genPop).length > 0 && ( // Show map popup if popupVisible is set to true and properties
            // exist in genPop
            <MapPopup
              cursorX={cursorX}
              cursorY={cursorY}
              display={popupVisible}
              popupValuesObj={genPop}
            />
          )}
        {popupVisible &&
          Object.keys(genPopPer).length > 0 && ( // Show map popup if popupVisible is set to true and properties
            // exist in genPopPer
            <MapPopup
              cursorX={cursorX}
              cursorY={cursorY}
              display={popupVisible}
              popupValuesObj={genPopPer}
            />
          )}
        {popupVisible &&
          popupString && ( // Show map popup if popupVisible is set to true and properties
            // exist in genPopPer
            <MapPopup
              cursorX={cursorX}
              cursorY={cursorY}
              display={popupVisible}
              usingString={true}
              commentString={popupString}
            />
          )}
        {isLoading && <LoadingScreen />}
        <div ref={mapContainer} id="map-container" className="map-container" />
      </>
    </div>
  );
};
