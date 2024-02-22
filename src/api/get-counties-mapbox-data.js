import axios from "axios";
const mapdataUrl = "http://localhost:3008/get-florida-mapbox-data";

export const getCountyMapData = async (state, date1, date2) => {
  const response =
    date1 && date2
      ? await axios
          .get(mapdataUrl, {
            params: { state: state, date1: date1, date2: date2 },
          })
          .then((result) => result)
          .catch((err) =>
            console.log(
              "Something went wrong trying to fetch map data from api: ",
              err
            )
          )
      : date1
      ? await axios
          .get(
            mapdataUrl,
            { params: { state: state, date1: date1 } }
            // { timeout: 5000 }
          )
          .then((result) => result)
          .catch((err) =>
            console.log(
              "Something went wrong trying to fetch map data from api: ",
              err
            )
          )
      : await axios
          .get(mapdataUrl, { state: state })
          .then((result) => result)
          .catch((err) =>
            console.log(
              "Something went wrong trying to fetch map data from api: ",
              err
            )
          );
  return response;
};
