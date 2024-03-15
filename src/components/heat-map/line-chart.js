import React, { useState } from "react";
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
  graphStartDate,
  graphEndDate,
  graphData,
  isLoading,
  disease,
  diseases,
}) => {
  const chartTitle = diseases.data.filter(
    (d) => d.disease_cases_key === disease
  )[0].disease_description;

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
              color: "white",
              width: "100%",
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
  );
};
