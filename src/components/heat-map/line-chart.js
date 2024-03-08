import React, { useEffect, useState } from "react";
import { getMapLineGraphData } from "../../api/get-map-line-graph-data";
import { getCountyMapData } from "../../api/get-counties-mapbox-data";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
// import faker from "faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const LineChart = ({
  chartTitle,
  graphStartDate,
  graphEndDate,
  // filter,
  county,
  disease,
  currentSwitch,
  countyMapData,
  state,
  selectedState,
  currentUsState,
}) => {
  const [graphData, setGraphData] = useState([]);
  const [gData, setGData] = useState();
  const [currentCounty, setCurrentCounty] = useState();
  const [dateActive, setDateActive] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // const [lineColor, setLineColor] = useState();
  const getRandomColor = () => {
    return `#${Math.random().toString(16).substring(2, 10)}`;
  };
  useEffect(() => {
    // setLineColor(getRandomColor());
    setIsLoading(true);
    console.log("loading1:", isLoading);
    const getData = async () => {
      //   console.log("Other Map Data:", getOtherData);
      // const getGraphData = [];
      // for (let i = 0; state > i; i++) {
      //   const fetchGraphData = await getMapLineGraphData(
      //     state[i],
      //     startDate,
      //     endDate
      //   );
      //   getGraphData.push(fetchGraphData);

      //   console.log("graphData1:", state[i]);
      // }
      // const usState = state.filter(s === currentUsState)
      setGraphData([]);
      const currentGraphData = [];
      graphData?.map(async (gd) => {
        const getGraphData = await getMapLineGraphData(
          gd.label.split(" - ")[0],
          gd.label.split(" - ")[1],
          graphStartDate,
          graphEndDate
        );
        console.log("date county:", gd);
        const lineGraphData = getGraphData?.data?.map(
          (gd) =>
            Object.values(
              JSON.parse(gd.incidences).filter(
                (i) => Object.keys(i)[0] === disease
              )[0]
            )[0]
        );

        console.log("date lineGraphData1:", getGraphData.data);

        console.log("date lineGraphData:", lineGraphData);
        lineGraphData.map((l) => console.log("line:", l));

        const lineColor = getRandomColor();
        const getCurrentGraphData = () => {
          return {
            label: gd.label,
            color: "white",
            data: lineGraphData?.map((l) => l),
            borderColor: "black",
            backgroundColor: gd.backgroundColor,
          };
        };
        // console.log("gData:", gData2);
        const currentLineData = getCurrentGraphData();
        setGraphData((g) => [...g, currentLineData]);
        // setGData((g) => {
        //   return { ...g, datasets: graphData };
        // });
        currentGraphData.push(currentLineData);
      });
      // const currentCounty = getGraphData.data.map((gd) =>
      //   gd.filter((d) => d.county === county && d.state_ab ==).map((s) => s.county)
      // )[0][0];
      // const lineData = gData[0];
      // console.log("lineData:", gData[0]);

      // setGraphData((gd) => [...gd, currentGraphData]);
      // console.log("Heatmap Graph Data:", currentGraphData);

      console.log("date graph data:", graphData);
      const thisGraphData = currentGraphData.length > 0 ? currentGraphData : "";
      const beginDate = new Date(graphStartDate);
      const endingDate = new Date(graphEndDate);
      const diffTime = Math.abs(endingDate - beginDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dayLabels = [];

      for (let i = 0; i <= diffDays; i++) {
        const date = new Date(beginDate);
        const currentDate = new Date(date.setDate(date.getDate() + i))
          .toISOString()
          .split("T")[0];
        dayLabels.push(currentDate);
      }
      // const dataUpdate = graphData.map(
      //   (gd) => (gd.data = currentGraphData.data)
      // );
      // console.log("dataUpdpate:", dataUpdate);
      setGData({ labels: dayLabels, datasets: graphData });
    };
    getData();
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    console.log("loading2:", isLoading);
    console.log("gData for real1:", gData);
  }, [graphStartDate, graphEndDate]);
  useEffect(() => {
    setIsLoading(true);
    console.log("loading3:", isLoading);
    const getData = async () => {
      //   console.log("Other Map Data:", getOtherData);
      // const getGraphData = [];
      // for (let i = 0; state > i; i++) {
      //   const fetchGraphData = await getMapLineGraphData(
      //     state[i],
      //     startDate,
      //     endDate
      //   );
      //   getGraphData.push(fetchGraphData);

      //   console.log("graphData1:", state[i]);
      // }
      // const usState = state.filter(s === currentUsState)
      const getGraphData = await getMapLineGraphData(
        currentUsState,
        county,
        graphStartDate,
        graphEndDate
      );
      // const currentCounty = getGraphData.data.map((gd) =>
      //   gd.filter((d) => d.county === county && d.state_ab ==).map((s) => s.county)
      // )[0][0];

      console.log("lineGraphData1:", getGraphData.data);
      const lineGraphData = getGraphData?.data?.map(
        (gd) =>
          Object.values(
            JSON.parse(gd.incidences).filter(
              (i) => Object.keys(i)[0] === disease
            )[0]
          )[0]
      );
      // const lineData = gData[0];
      // console.log("lineData:", gData[0]);

      console.log("lineGraphData:", lineGraphData);
      lineGraphData.map((l) => console.log("line:", l));
      const lineColor = getRandomColor();
      const getCurrentGraphData = {
        label: `${currentUsState} - ${county}`,
        color: "white",
        data: lineGraphData?.map((l) => l),
        borderColor: "black",
        backgroundColor: lineColor,
      };
      // console.log("gData:", gData2);
      const currentGraphData = getCurrentGraphData;
      console.log("current graph data2:", currentGraphData);
      setGraphData((g) => [...g, currentGraphData]);
      // console.log("Heatmap Graph Data:", currentGraphData);
      const beginDate = new Date(graphStartDate);
      const endingDate = new Date(graphEndDate);
      const diffTime = Math.abs(endingDate - beginDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dayLabels = [];

      for (let i = 0; i <= diffDays; i++) {
        const date = new Date(beginDate);
        const currentDate = new Date(date.setDate(date.getDate() + i))
          .toISOString()
          .split("T")[0];
        dayLabels.push(currentDate);
      }

      setRefreshCount((c) => c++);
      setGData({ labels: dayLabels, datasets: graphData });

      console.log("gData for real2:", gData);
    };
    getData();
    setDateActive(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    console.log("loading4:", isLoading);
  }, [county]);
  //   console.log("start date: ", startDate);
  //   console.log("Day labels: ", dayLabels);
  //   console.log("endDate: ", endDate);
  const randomNum = (range1, range2) =>
    Math.floor(Math.random() * (range2 - range1 + 1)) + range1;
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        color: "white",
        display: true,
        // text: `${chartTitle}`,
      },
    },
  };
  return (
    // <div style={{ width: "90%", margin: "auto", textAlign: "center" }}>
    //   {!isLoading && gData?.datasets ? (
    //     <div
    //       style={{ backgroundColor: "white", width: "100%", margin: "auto" }}
    //     >
    //       <Line
    //         options={options}
    //         data={gData}
    //         style={{
    //           // backgroundColor: "white",
    //           color: "white",
    //           // border: "2px solid gray",
    //           width: "90%",
    //           margin: "auto",
    //         }}
    //       />
    //     </div>
    //   ) : (
    //     <div style={{ color: "white", width: "100%", margin: "auto" }}>
    //       <h1>Loading...</h1>
    //     </div>
    //   )}
    // </div>
    <div style={{ color: "white" }}>
      {gData &&
        Object?.values(gData)?.map((g, idx) => {
          if (typeof g === "object") {
            return Object.values(g).map((gd) => {
              if (typeof gd === "object") {
                return Object.values(gd).map((gdo) => {
                  return <p>{gdo}</p>;
                });
              }
            });
          } else {
            return <p>{g}</p>;
          }
        })}
    </div>
  );
};
