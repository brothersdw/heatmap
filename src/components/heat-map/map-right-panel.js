import { useState, useEffect } from "react";
import { DatePicker, SlidingPanel, LineChart } from ".";
import { getMapLineGraphData } from "../../api/get-map-line-graph-data";

// const getRandomColor = () => {
//   return `#${Math.random().toString(16).substring(2, 10)}`;
// };

const getRandomColor = () => {
  let letters = "BCDEF".split("");
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
};

export const RightPanel = ({
  title,
  rightPanelInfo,
  rightPanelStartDate,
  setRightPanelStartDate,
  rightPanelEndDate,
  setRightPanelEndDate,
  county,
  disease,
  diseases,
  currentSwitch,
  countyMapData,
  state,
  selectedState,
  currentUsState,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const [graphData, setGraphData] = useState([]);
  const date = new Date();
  const dateToISOString = new Date(date.setDate(date.getDate())).toISOString();
  const currentDayStart = dateToISOString.split("T")[0];
  const currentDayEnd = dateToISOString.split("T")[0] + "T23:59:59Z";

  const addCountyData = async () => {
    const currentDataExists =
      graphData?.filter(
        (gd) =>
          String(gd?.label?.split(" - ")[0]).toUpperCase() ===
            String(currentUsState).toUpperCase() &&
          String(gd?.label?.split(" - ")[1]).toUpperCase() ===
            String(county).toUpperCase()
      ).length > 0;
    if (currentDataExists) return;
    const getGraphData = await getMapLineGraphData(
      currentUsState,
      county,
      rightPanelStartDate,
      rightPanelEndDate
    );

    console.log("lineGraphData1:", getGraphData.data);
    const lineGraphData = getGraphData?.data?.map(
      (gd) =>
        Object.values(
          JSON.parse(gd.incidences).filter(
            (i) => Object.keys(i)[0] === disease
          )[0]
        )[0]
    );

    console.log("lineGraphData:", lineGraphData);
    lineGraphData.map((l) => console.log("line:", l));
    const lineColor = getRandomColor();
    const currentGraphData = {
      label: `${currentUsState} - ${county}`,
      color: "white",
      data: lineGraphData?.map((l) => l),
      borderColor: lineColor,
      backgroundColor: lineColor,
    };

    const graphDataLabels = graphData.map((gd) => gd.label);
    const dateRangeUpdate = graphData?.filter(
      (gd, idx) =>
        String(gd?.label?.split(" - ")[0]).toUpperCase() ===
          String(currentUsState).toUpperCase() &&
        String(gd?.label?.split(" - ")[1]).toUpperCase() ===
          String(county).toUpperCase()
    );
    const currentUpdate =
      dateRangeUpdate?.length > 0
        ? graphData?.map((gdm) => {
            return { ...gdm, data: currentGraphData.data };
          })
        : currentGraphData;
    console.log("current update: ", currentGraphData);

    const dateCountyUpdateSwitch = dateRangeUpdate.length > 0;
    console.log("current graph data2:", currentGraphData);
    // console.log("Heatmap Graph Data:", currentGraphData);
    console.log("dateRange switch:", dateCountyUpdateSwitch);
    const setData = (existingData, newData) => {
      // console.log(
      //   "Label man:",
      //   String(Object?.values(d)[0]?.label?.split(" - ")[1]).toUpperCase()
      // );
      return String(
        Object?.values(existingData)[0]?.label?.split(" - ")[0]
      ).toUpperCase() === String(currentUsState).toUpperCase() &&
        String(county).toUpperCase() ===
          String(
            Object?.values(existingData)[0]?.label?.split(" - ")[1]
          ).toUpperCase()
        ? newData
        : [...existingData, newData];
    };

    // currentUpdate && dateRangeUpdate?.length < 1
    //   ? setGraphData((g) => currentUpdate)
    //   :
    setGraphData((g) => [...g, currentUpdate]);
    // const testy = await checkDuplicateDataEntries(...graphData);
    // console.log("Dupe entries:", testy);
    // setGraphData(testy);
    // setGraphData(graphData.pop());
  };

  const addDateData = async () => {
    const currentUpdate = [];
    graphData.map(async (currentData) => {
      const gdState = String(currentData?.label?.split(" - ")[0]).toUpperCase();
      const gdCounty = String(
        currentData?.label?.split(" - ")[1]
      ).toUpperCase();
      const getGraphData = await getMapLineGraphData(
        gdState,
        gdCounty,
        rightPanelStartDate,
        rightPanelEndDate
      );
      const lineGraphData = getGraphData?.data?.map(
        (gd) =>
          Object.values(
            JSON.parse(gd.incidences).filter(
              (i) => Object.keys(i)[0] === disease
            )[0]
          )[0]
      );

      console.log("lineGraphData:", lineGraphData);
      lineGraphData.map((l) => console.log("line:", l));
      const lineColor = getRandomColor();
      const currentGraphData = {
        label: currentData.label,
        color: "white",
        data: lineGraphData?.map((l) => l),
        borderColor: lineColor,
        backgroundColor: lineColor,
      };

      currentUpdate.push(currentGraphData);
    });
    setGraphData(currentUpdate);
  };
  useEffect(() => {
    title !== currentTitle && title ? setIsOpen(true) : setIsOpen(false);
    setCurrentTitle(title);
    console.log("right panel open: ", isOpen);
  }, [title]);
  useEffect(() => {
    // setLineColor(getRandomColor());
    setIsLoading(true);
    county && addCountyData();
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [county]);

  useEffect(() => {
    setIsLoading(true);
    county && addDateData();
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [rightPanelStartDate, rightPanelEndDate, disease]);
  return (
    <SlidingPanel
      panelClass="right"
      title={title}
      secondaryPanelSwitch={isOpen}
      setSecondaryPanelSwitch={setIsOpen}
    >
      {county && (
        <>
          {Object.keys(rightPanelInfo).map((r, idx) => {
            if (r !== "components") {
              return (
                <p className="county-stat" key={`stat-${idx}`}>
                  <strong>{r}:</strong> {rightPanelInfo[r]}
                </p>
              );
            } else {
              return rightPanelInfo[r].map((component) => {
                return component;
              });
            }
          })}
          <DatePicker
            multiSelect
            maxDate={currentDayStart}
            minDate={currentDayStart}
            date1={rightPanelStartDate}
            date2={rightPanelEndDate}
            setDate1={setRightPanelStartDate}
            setDate2={setRightPanelEndDate}
          />
          {rightPanelInfo ? (
            <LineChart
              countyMapData={countyMapData}
              currentSwitch={currentSwitch}
              disease={disease}
              diseases={diseases}
              county={county}
              // chartTitle={title}
              graphData={graphData}
              graphStartDate={rightPanelStartDate}
              graphEndDate={rightPanelEndDate}
              state={state}
              isLoading={isLoading}
              currentUsState={currentUsState}
              filter={rightPanelInfo}
            />
          ) : (
            <div style={{ color: "white", zIndex: 2 }}>Loading Graph...</div>
          )}
        </>
      )}
    </SlidingPanel>
  );
};
