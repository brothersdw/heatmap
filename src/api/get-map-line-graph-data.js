import axios from "axios";
const mapdataUrl = "http://localhost:3008/get-map-line-graph-data";

export const getMapLineGraphData = async (startDate, endDate) => {
  const response = await axios
    .get(
      mapdataUrl,
      { params: { startDate: startDate, endDate: endDate } },
      { timeout: 5000 }
    )
    .then((result) => result)
    .catch((err) =>
      console.log(
        "Something went wrong trying to fetch map data from api: ",
        err
      )
    );
  return response;
};
