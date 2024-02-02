export const addMapLayer = (
  layerProperties = {},
  getProperty = "",
  zoomProp = "",
  usesGetMethod = true
) => {
  const fillColor = [
    "interpolate",
    ["linear"],
    usesGetMethod ? ["get", getProperty] : getProperty,
  ];
  layerProperties.stops.map((s) => {
    return fillColor.push(s[0], s[1]);
  });
  console.log(fillColor);
  return {
    id: layerProperties.id,
    type: "fill",
    [`${zoomProp}`]: layerProperties.zoomThreshold,
    paint: {
      "fill-outline-color": "white",
      "fill-color": fillColor,
      "fill-opacity": layerProperties.fillOpacity,
    },
    source: layerProperties.source,
  };
};

export const friendlyNumber = (num = 0) => {
  const numString = num.toString().split("");
  let newNumber = "";
  const addCommas = numString.map((n, idx) => {
    const count = idx + 1;
    const currentIndex = numString.length - count;
    console.log(count);
    const addComma = count % 3 === 0;
    if (addComma && currentIndex !== 0) {
      return `,${numString[currentIndex]}`;
    }
    return numString[numString.length - count];
  });
  addCommas.map((char, idx) => {
    console.log(char);
    const count = idx + 1;
    newNumber = newNumber + addCommas[addCommas.length - count];
  });
  console.log("New Number:", newNumber);
  return newNumber;
};
