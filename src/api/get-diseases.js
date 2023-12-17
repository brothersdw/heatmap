import axios from "axios";
const diseasesUrl = "http://localhost:3008/get-diseases";

export const getDiseases = async () => {
  const response = await axios
    .get(diseasesUrl, {
      timeout: 5000,
    })
    .then((result) => result)
    .catch((err) =>
      console.log(
        "Something went wrong trying to fetch disease data from api: ",
        err
      )
    );
  return response;
};
