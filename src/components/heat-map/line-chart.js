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
}) => {
  const [graphData, setGraphData] = useState([]);
  const [data, setData] = useState();
  const [currentCounty, setCurrentCounty] = useState(county);
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
      const getGraphData = await getMapLineGraphData(
        state,
        graphStartDate,
        graphEndDate
      );
      // const currentCounty = getGraphData.data.map((gd) =>
      //   gd.filter((d) => d.county === county && d.state_ab ==).map((s) => s.county)
      // )[0][0];
      const thisGraphData = getGraphData.data.map((gd) => {
        return gd.map((gdm) => {
          return {
            state: gdm.state_ab,
            county: gdm.county,
            value: Object.values(
              JSON.parse(gdm.incidences).filter(
                (gi) => Object.keys(gi)[0] === disease
              )[0]
            )[0],
          };
        });
      });
      const currentState = String(
        getGraphData?.data?.map((gd) =>
          gd.map((d) =>
            state.filter(
              (s) =>
                String(s).toUpperCase() === String(d.state_ab).toUpperCase()
            )
          )
        )[0][0]
      ).toUpperCase();
      const currentCounty = String(
        getGraphData?.data?.map((gd) => {
          return gd.filter((d) => d.county === county);
        })[0][0]?.county
      );
      // const extractGraphData = getGraphData.data.map((gd) =>
      //   gd
      //     .filter((d) => d.county === county)
      //     .map((c) => JSON.parse(c.incidences))
      //     .map(
      //       (i) =>
      //         Object.values(i).filter(
      //           (dis) => Object.keys(dis)[0] === disease
      //         )[0]
      //     )
      // );
      console.log("currentState:", currentState);
      console.log("currentCounty:", currentCounty);
      console.log("get graph data:", thisGraphData);
      const gData = thisGraphData?.data?.filter(
        (g) => g.county === county && g.state === selectedState
      );
      // const lineData = gData[0];
      // console.log("lineData:", gData[0]);
      const getCurrentGraphData = () => {
        const lineColor = getRandomColor();
        return {
          label: currentCounty,
          color: "white",
          data: gData?.map((l) => l.value),
          borderColor: lineColor,
          backgroundColor: lineColor,
        };
      };
      // console.log("gData:", gData2);
      const currentGraphData = getCurrentGraphData();
      // setGraphData((gd) => [...gd, currentGraphData]);
      console.log("Heatmap Graph Data:", currentGraphData);
      // const graphDataArrayValues = {
      //   county: currentCounty,
      //   disease_values: extractGraphData.map((ed) =>
      //     ed.map((e) => Object.values(e)[0])
      //   ),
      // };
      currentCounty === county
        ? setGraphData((g) => [g.data, currentGraphData.map((l) => l.value)])
        : setGraphData((g) => [...g, currentGraphData]);

      console.log("graph data2:", currentGraphData);

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

      setData({ labels: dayLabels, datasets: graphData });
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
