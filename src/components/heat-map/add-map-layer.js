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
