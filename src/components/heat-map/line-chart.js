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
  startDate,
  endDate,
  filter,
  county,
  disease,
  currentSwitch,
  countyMapData,
  state,
}) => {
  const [graphData, setGraphData] = useState();
  useEffect(() => {
    const getData = async () => {
      //   console.log("Other Map Data:", getOtherData);
      console.log("County Map data: ", countyMapData);
      const testData = countyMapData?.features.filter(
        (c) => c.properties.county === county
      );
      console.log("testData:", testData);
      const getGraphData = await getMapLineGraphData(state, startDate, endDate);
      const extractGraphData = getGraphData.data
        .filter((d) => d.county === county)
        .map((c) => JSON.parse(c.incidences))
        .map(
          (i) =>
            Object.values(i).filter((dis) => Object.keys(dis)[0] === disease)[0]
        );
      const graphDataArrayValues = extractGraphData.map(
        (e) => Object.values(e)[0]
      );
      console.log("graph data:", graphDataArrayValues);
      setGraphData(graphDataArrayValues);
    };
    getData();
  }, [startDate, endDate, filter]);
  const beginDate = new Date(startDate);
  const endingDate = new Date(endDate);
  const diffTime = Math.abs(endingDate - beginDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const dayLabels = [];
  //   console.log("start date: ", startDate);
  for (let i = 0; i <= diffDays; i++) {
    const date = new Date(beginDate);
    const currentDate = new Date(date.setDate(date.getDate() + i))
      .toISOString()
      .split("T")[0];
    dayLabels.push(currentDate);
  }
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
        text: `${chartTitle}`,
      },
    },
  };

  const data = {
    labels: dayLabels,
    datasets: [
      {
        label: chartTitle,
        color: "white",
        data: graphData?.map((g) => g),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };
  return (
    <>
      {graphData && (
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
    </>
  );
};
