export const DiseaseDropDown = ({
  mapLeftPos, // Grabbing props from HeatMap component
  mapTopPos,
  diseases,
  disease,
  setDisease,
}) => {
  const dropDownStyle = {
    // This style is dynamic to adjust position of dropdown based on window size
    width: "200px",
    textAlign: "center",
    position: "absolute",
    padding: "10px",
    backgroundColor: "#147eff",
    color: "white",
    top: `${mapTopPos - 68}px`,
    left: mapLeftPos,
    zIndex: 2,
  };
  return (
    /* Selection dropdown for various diseases. The disease state is passed down from the HeatMap component
           and must stay there as it reloads the HeatMap based on the disease state. */
    <select
      value={disease} // Set current value of dropdown to state of disease.
      onChange={(e) => setDisease(e.target.value)} // Set disease state to selected value when changed.
      style={dropDownStyle}
    >
      {diseases.data.map((item, idx) => {
        // Map through diseases and return value and description of each disease
        return (
          <option
            key={item.disease_cases_key}
            style={{ textAlign: "center" }}
            value={item.disease_cases_key} // Value of each option. A new selection will change the state of disease
          >
            {item.disease_description}
            {/* Disease description. This is what is seen in the box when selected */}
          </option>
        );
      })}
    </select>
  );
};
