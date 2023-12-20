import axios from "axios"; // Import axios to send request
const diseasesUrl = "http://localhost:3008/get-diseases"; // Set url

// Async function to fetch diseases
export const getDiseases = async () => {
  // Await response from api
  const response = await axios
    .get(diseasesUrl)
    .then((result) => result)
    .catch((err) =>
      console.log(
        "Something went wrong trying to fetch disease data from api: ",
        err
      )
    );
  return response;
};
