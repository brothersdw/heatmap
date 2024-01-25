export const DiseaseDropDown = ({
  // Grabbing props from HeatMap component
  diseases,
  disease,
  setDisease,
}) => {
  return (
    /* Selection dropdown for various diseases. The disease state is passed down from the HeatMap component
           and must stay there as it reloads the HeatMap based on the disease state. */
    <select
      className="disease-dropdown"
      value={disease} // Set current value of dropdown to state of disease.
      onChange={(e) => setDisease(e.target.value)} // Set disease state to selected value when changed.
      // style={dropDownStyle}
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
