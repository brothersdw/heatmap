import axios from "axios";
const mapdataUrl = "http://localhost:3008/get-state-mapbox-data";

export const getStateMapData = async (state) => {
  const response = await axios
    .get(mapdataUrl, { params: { state: state } })
    .then((result) => result)
    .catch((err) =>
      console.log(
        "Something went wrong trying to fetch map data from api: ",
        err
      )
    );
  return response;
};
