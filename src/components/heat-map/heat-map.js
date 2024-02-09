import React, { useRef, useEffect, useState } from "react";
import { getCountyMapData } from "../../api/get-counties-mapbox-data"; // Import function to fetch map data
import { getStateMapData } from "../../api/get-state-mapbox-data";
import { getDiseases } from "../../api/get-diseases"; // Import function to fetch diseases
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
const publicToken = require("../../tokens.json").publicToken; // Can exchange this for your own mapbox token
const diseases = await getDiseases(); // Await fetch function for diseases and set diseases to response
const date = new Date();
const dateToISOString = new Date(date.setDate(date.getDate())).toISOString();
const currentDayStart = dateToISOString.split("T")[0];
const currentDayEnd = dateToISOString.split("T")[0];
const countyData = await getCountyMapData(currentDayStart); // Await fetch function for map data and set mData to response
// const countyMapData = countyData.data;
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
  const [countyMapData, setCountyMapData] = useState(countyData.data);
  // const [map, setMap] = useState(null);
  const [lng, setLng] = useState(-83.75357); // Set default lng, lat to center on Florida. Also used for DataBox component display
  const [lat, setLat] = useState(27.791858);
  const [zoom, setZoom] = useState(5); // This will be used to set boundary state
  const [cursorX, setCursorX] = useState(); // Grabs the x position of the cursor for the MapPopup component
  const [cursorY, setCursorY] = useState(); // Grabs the y position of the cursor for the MapPopup component
  const [popupVisible, setPopupVisible] = useState(false); // Controls visible state of MapPopup
  const [cases, setCases] = useState({}); // Controls number of cases displayed in MapPopup and DataBox components as well as disease description in MapPopup
  const [disease, setDisease] = useState(diseases.data[0].disease_cases_key); // Controls the current disease that is chosen
  const [selectedCounty, setSelectedCounty] = useState(""); // Selected county for info panel display
  const [selectedState, setSelectedState] = useState(""); // Selected state for info panel display
  const [selectedCases, setSelectedCases] = useState({}); // Selected cases for info panel display
  const [selectedGenPop, setSelectedGenPop] = useState({}); // Selected gen pop for info panel display
  const [selectedGenPopPer, setSelectedGenPopPer] = useState({}); // Selected gen pop percentage for info panel display
  const [caseInfoSwitch, setCaseInfoSwitch] = useState(true);
  const [casesSwitch, setCasesSwitch] = useState(true); // State for cases toggle switch
  const [toggleState, setToggleState] = useState({}); // toggleState for toggle switch
  const [genPopSwitch, setGenPopSwitch] = useState(false); // State for genPop toggle switch
  const [genPopPerSwitch, setGenPopPerSwitch] = useState(false); // State for genPop percentage toggle switch
  const [genPop, setGenPop] = useState({}); // Controls what is displayed in the popup for genPop statistics
  const [genPopPer, setGenPopPer] = useState({}); // Controls what is displayed in the popup for genPop statistics
  const [rightPanelStartDate, setRightPanelStartDate] =
    useState(currentDayStart); // State for start date of date picker in right panel this will be used for graphs
  const [rightPanelEndDate, setRightPanelEndDate] = useState(currentDayEnd); // State for start date of date picker in
  // right panel this will be used for graphs
  const [leftPanelDate, setLeftPanelDate] = useState(currentDayStart); // State for start date of date picker in left panel
  // this is used to show heatmap and cases for a specific date
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const stateGenPopulationTotal = countyMapData.features.reduce(
      // Summing all county populations for state population
      (acc, curr) => {
        return acc + curr.properties.genPopulation;
      },
      0
    );
    let countyCount = 0;
    countyMapData.features.map((c) => {
      countyCount++;
    });
    const stateGenPopulationPerSumTotal = countyMapData.features.reduce(
      (acc, curr) => {
        return acc + curr.properties[`${disease}_cases_percentage`];
      },
      0
    );

    const stateGenPopulationPerTotal =
      stateGenPopulationPerSumTotal / countyCount;
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
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
      projection: "globe",
    });

    const addMapSource = (sourceName = "", dataType = "", dataObj = {}) => {
      // function to add map sources
      map.addSource(sourceName, {
        type: dataType,
        data: dataObj,
      });
    };
    // Map on load event
    map.on("load", (e) => {
      // Add map sources {
      addMapSource("counties", "geojson", countyMapData);
      addMapSource("state", "geojson", stateMapData);
      addMapSource("gen-pop-county", "geojson", countyMapData);
      addMapSource("gen-pop-state", "geojson", stateMapData);
      addMapSource("gen-pop-per-county", "geojson", countyMapData);
      addMapSource("gen-pop-per-state", "geojson", stateMapData);
      //}

      // Adding map layers conditionally {
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
          addMapLayer(genPopCountyLayerProperties, "genPopulation", "minzoom"),
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

      map.on("move", "gen-pop-per-county", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });

      map.on("move", "gen-pop-per-state", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });
      // }

      // When cursor enters boundaries set popupVisible to true and change cursor to a "pointer" from "grab" {
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
      map.on("mouseenter", "gen-pop-per-county", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseenter", "gen-pop-per-state", (e) => {
        setPopupVisible(true);
        map.getCanvas().style.cursor = "pointer";
      });
      // }

      // When the cursor is moving within boundaries of Florida set cursorx and y, set county and set cases for each layer
      // {
      map.on("mousemove", "counties", (e) => {
        setCases({});
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

      map.on("mousemove", "state", (e) => {
        setCases({});
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

      map.on("mousemove", "gen-pop-county", (e) => {
        setGenPop({});
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
            "General Population": friendlyNumber(stateGenPopulationTotal),
          };
        });
      });

      // When the cursor is moving within county boundaries of Florida set cursorx and y, set county and set genPop {
      map.on("mousemove", "gen-pop-per-county", (e) => {
        setGenPop({});
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
            "Case Percentage of Population": `${genPopulationPer.toFixed(2)}%`,
          };
        });
      });

      map.on("mousemove", "gen-pop-per-state", (e) => {
        setGenPopPer({});
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
            Cases: friendlyNumber(diseaseCases),
          };
        });
      });
      // }

      // When boundary in layer is clicked set selectedState and set selectedCases {
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
            Cases: friendlyNumber(diseaseCases),
          };
        });
      });

      map.on("click", "gen-pop-county", (e) => {
        setSelectedCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
        const genPopulation = e.features[0].properties["genPopulation"]; // Set to value of current disease_cases_key
        // for the county the cursor is currently in. Used in Databox and MapPopup components

        // Set selectedGenPop to object with General Population
        setSelectedGenPop((c) => {
          return {
            ...c,
            "General Population": friendlyNumber(genPopulation),
          };
        });
      });

      map.on("click", "gen-pop-state", (e) => {
        setSelectedCounty("");
        setSelectedState(e.features[0].properties.state); // Set to value of current state that has been clicked
        // MapPopup components

        // Set selectedGenPop to object with General Population
        setSelectedGenPop((c) => {
          return {
            ...c,
            "General Population": friendlyNumber(stateGenPopulationTotal),
          };
        });
      });

      map.on("click", "gen-pop-per-county", (e) => {
        setSelectedGenPopPer({});
        setSelectedCounty(e.features[0].properties.county); // Set to county that the cursor is currently in
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
            "Case Percentage of Population": `${genPopulationPer.toFixed(2)}%`,
          };
        });
      });

      map.on("click", "gen-pop-per-state", (e) => {
        setSelectedGenPopPer({});
        setSelectedCounty("");
        setSelectedState(e.features[0].properties.state); // Set to value of current state that has been clicked
        // MapPopup components

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
      map.on("mouseleave", "gen-pop-per-county", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
      map.on("mouseleave", "gen-pop-per-state", () => {
        setPopupVisible(false);
        map.getCanvas().style.cursor = "grab";
      });
    });
    console.log("isLoading:", isLoading);
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
          toggleState={toggleState}
          setToggleState={setToggleState}
          leftPanelDate={leftPanelDate}
          setLeftPanelDate={setLeftPanelDate}
          setData1={setCountyMapData}
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
        {isLoading && <LoadingScreen />}
        <div ref={mapContainer} id="map-container" className="map-container" />
      </>
    </div>
  );
};
