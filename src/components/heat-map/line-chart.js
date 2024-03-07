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
  filter,
  county,
  disease,
  currentSwitch,
  countyMapData,
  state,
  selectedState,
  currentUsState,
}) => {
  const [graphData, setGraphData] = useState([]);
  const [data, setData] = useState();
  const [currentCounty, setCurrentCounty] = useState();
  // const [lineColor, setLineColor] = useState();
  const getRandomColor = () => {
    return `#${Math.random().toString(16).substring(2, 10)}`;
  };
  useEffect(() => {
    // setLineColor(getRandomColor());
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
      const getCurrentGraphData = () => {
        const lineColor = getRandomColor();
        return {
          label: `${currentUsState} - ${county}`,
          color: "white",
          data: lineGraphData?.map((l) => l),
          borderColor: lineColor,
          backgroundColor: lineColor,
        };
      };
      // console.log("gData:", gData2);
      const currentGraphData = getCurrentGraphData();
      setGraphData((gd) => [...gd, currentGraphData]);
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
      const lineColor = getRandomColor();
      setData({ labels: dayLabels, data: graphData });
    };
    getData();
  }, [graphStartDate, graphEndDate, county]);
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
    <div style={{ backgroundColor: "white", width: "90%", margin: "auto" }}>
      {graphData && data && (
        <Line
          options={options}
          data={data}
          style={{
            // backgroundColor: "white",
            color: "white",
            // border: "2px solid gray",
            width: "90%",
            margin: "auto",
          }}
        />
      )}
    </div>
  );
};
