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
  // const [lineColor, setLineColor] = useState();
  const getRandomColor = () => {
    return `#${Math.random().toString(16).substring(2, 10)}`;
  };
  useEffect(() => {
    // setLineColor(getRandomColor());
    const getData = async () => {
      //   console.log("Other Map Data:", getOtherData);
      console.log("County Map data2: ", countyMapData && countyMapData);
      console.log("testData:", filter);
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
      const getGraphData = await getMapLineGraphData(state, startDate, endDate);
      const currentCounty = getGraphData.data.map((gd) =>
        gd.filter((d) => d.county === county).map((s) => s.county)
      )[0][0];
      const extractGraphData = getGraphData.data.map((gd) =>
        gd
          .filter((d) => d.county === county)
          .map((c) => JSON.parse(c.incidences))
          .map(
            (i) =>
              Object.values(i).filter(
                (dis) => Object.keys(dis)[0] === disease
              )[0]
          )
      );
      const graphDataArrayValues = {
        county: currentCounty,
        disease_values: extractGraphData.map((ed) =>
          ed.map((e) => Object.values(e)[0])
        ),
      };
      setGraphData(graphDataArrayValues);

      console.log("graph data2:", graphDataArrayValues);
    };
    getData();
  }, [startDate, endDate, filter, county]);
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
        // text: `${chartTitle}`,
      },
    },
  };

  const data = {
    labels: dayLabels,
    datasets: graphData?.disease_values?.map((gd, idx) => {
      const lineColor = getRandomColor();
      return {
        label: graphData[idx]?.county,
        color: "white",
        data: gd?.map((g) => g),
        // borderColor: "rgb(255, 99, 132)",
        borderColor: lineColor,
        // backgroundColor: "rgba(255, 99, 132, 1)",
        backgroundColor: lineColor,
      };
    }),
  };
  return (
    <div style={{ backgroundColor: "white", width: "90%", margin: "auto" }}>
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
    </div>
  );
};
