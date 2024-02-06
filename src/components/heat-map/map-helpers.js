export const addMapLayer = (
  // Function to add layers in a more simple readable way. Objects are added to the
  // mapLayers.json file and imported from there to be used with this function
  layerProperties = {},
  getProperty = "",
  zoomProp = "", // There are only two choices here. The zoomProp should be either "maxzoom" or "minzoom"
  usesGetMethod = true
) => {
  if (zoomProp !== "maxzoom" && zoomProp !== "minzoom") {
    console.log(`"zoomProp" can should be either "minzoom" or "maxzoom"`);
    return;
  }
  const fillColor = [
    // Creating fill color array
    "interpolate",
    ["linear"],
    usesGetMethod ? ["get", getProperty] : getProperty, // If usesGetMethod is true then use the get method otherwise
    // use a numeric value
  ];
  layerProperties.stops.map((s) => {
    // Maps over the stops property of the object and pushes each value to fillColor array
    return fillColor.push(s[0], s[1]);
  });
  return {
    id: layerProperties.id, // id from layerProperties object
    type: "fill",
    [`${zoomProp}`]: layerProperties.zoomThreshold, // zoomThreshold property from layerProperties object
    paint: {
      "fill-outline-color": "white",
      "fill-color": fillColor, // fillColor array
      "fill-opacity": layerProperties.fillOpacity, // fillOpacity property of layerProperties object
    },
    source: layerProperties.source, // source property of layerProperties object
  };
};

export const friendlyNumber = (num = 0) => {
  // This function creates a friendly number with commas per thousand
  const numString = num.toString().split("");
  let newNumber = "";
  const addCommas = numString.map((n, idx) => {
    const count = idx + 1;
    const currentIndex = numString.length - count;
    const addComma = count % 3 === 0;
    if (addComma && currentIndex !== 0) {
      return `,${numString[currentIndex]}`;
    }
    return numString[numString.length - count];
  });
  addCommas.map((char, idx) => {
    const count = idx + 1;
    newNumber = newNumber + addCommas[addCommas.length - count];
  });
  return newNumber;
};
