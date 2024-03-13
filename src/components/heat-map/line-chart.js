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

const asyncFunction = async (cb1, cb2) => {
  await cb1();
  cb2();
};

export const LineChart = ({
  // chartTitle,
  graphStartDate,
  graphEndDate,
  graphData,
  isLoading,
  filter,
  county,
  disease,
  diseases,
  currentSwitch,
  countyMapData,
  state,
  selectedState,
  currentUsState,
}) => {
  // const [graphData, setGraphData] = useState([]);
  const [gData, setGData] = useState();
  const [currentCounty, setCurrentCounty] = useState();
  const [dateActive, setDateActive] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  // const [lineColor, setLineColor] = useState();

  // const currentGraphData = [];

  const chartTitle = diseases.data.filter(
    (d) => d.disease_cases_key === disease
  )[0].disease_description;

  const randomNum = (range1, range2) =>
    Math.floor(Math.random() * (range2 - range1 + 1)) + range1;

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
    datasets: graphData,
  };
  return (
    <div style={{ width: "90%", margin: "auto", textAlign: "center" }}>
      {!isLoading && graphData ? (
        <div
          style={{
            backgroundColor: "#1c1c1c",
            border: "2px solid #454545",
            width: "100%",
            margin: "auto",
          }}
        >
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
        </div>
      ) : (
        <div style={{ color: "white", width: "100%", margin: "auto" }}>
          <h1>Loading...</h1>
        </div>
      )}
    </div>
    // <div style={{ color: "white" }}>
    //   {/* {gData &&
    //     Object?.values(gData)?.map((g, idx) => {
    //       if (typeof g === "object") {
    //         return Object.values(g).map((gd) => {
    //           if (typeof gd === "object") {
    //             return Object.values(gd).map((gdo) => {
    //               return <p>{gdo}</p>;
    //             });
    //           }
    //         });
    //       } else {
    //         return <p>{g}</p>;
    //       }
    //     })} */}
    //   test
    // </div>
  );
};
