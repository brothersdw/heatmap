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
  chartTitle,
  graphStartDate,
  graphEndDate,
  graphData,
  isLoading,
  filter,
  county,
  disease,
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

  const checkDuplicateDataEntries = async (...initialArray) => {
    const checkArray = [];
    // checkArray.push("testy");
    console.log("test1:", initialArray.length);
    const mapArray = (valueArray = [], pushArray = []) => {
      valueArray?.map((v) => {
        let thisMatch = false;
        console.log("value array value:", v);
        const vaState = String(v?.label?.split(" - ")[0]).toUpperCase();
        const vaCounty = String(v?.label?.split(" - ")[1]).toUpperCase();
        console.log("vaLabel:", vaState);
        checkArray.map((c) => {
          const caState = String(c?.label?.split(" - ")[0]).toUpperCase();
          console.log("caLabel:", caState);
          const caCounty = String(c?.label?.split(" - ")[1]).toUpperCase();
          if (vaState === caState && vaCounty === caCounty) {
            thisMatch = true;
          }
        });
        if (!thisMatch) {
          return pushArray.push(v);
        }
      });
    };
    const test1 = mapArray(initialArray, checkArray);
    console.log("test array:", test1);
    return checkArray;
  };

  // const currentGraphData = [];

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
        // text: `${chartTitle}`,
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
          style={{ backgroundColor: "white", width: "100%", margin: "auto" }}
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
