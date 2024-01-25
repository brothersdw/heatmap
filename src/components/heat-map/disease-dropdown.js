import {
  EuiSelectable,
  EuiSuperSelect,
  EuiPopover,
  EuiButton,
} from "@elastic/eui";
import { useState } from "react";
export const DiseaseDropDown = ({
  // Grabbing props from HeatMap component
  dropDownOptions,
  setValue,
}) => {
  const [options, setOptions] = useState(dropDownOptions);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popOverTitle, setPopOverTitle] = useState(dropDownOptions[0].label);
  return (
    /* Selection dropdown for various diseases. The disease state is passed down from the HeatMap component
           and must stay there as it reloads the HeatMap based on the disease state. */

    <div
      className="select-dropdown-container"
      style={{ width: "80%", margin: "auto" }}
    >
      <EuiPopover
        style={{
          width: "100%",
          // margin: "auto",
          // backgroundColor: "white",
          // textAlign: "center",
        }}
        panelPaddingSize="none"
        button={
          <EuiButton
            style={{ width: "100%", margin: "auto" }}
            iconType="arrowDown"
            iconSide="right"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            {popOverTitle}
          </EuiButton>
        }
        isOpen={isPopoverOpen}
        closePopover={() => setIsPopoverOpen(false)}
      >
        <EuiSelectable
          aria-label="Searchable Dropdown"
          style={{
            width: "100%",
            padding: "30px",
            // margin: "auto",
            backgroundColor: "white",
            textAlign: "center",
          }}
          options={options}
          onChange={(newOptions) => {
            console.log("test dropdown:", newOptions);
            setOptions(newOptions);
          }}
          onActiveOptionChange={(currentOption) => {
            if (currentOption) {
              setValue(currentOption.value);
              setPopOverTitle(currentOption.label);
            }
          }}
          searchable
          // valueOfSelected={options[0]}
          singleSelection
          searchProps={{
            label: "",
          }}
        >
          {(list, search) => (
            <div>
              <div style={{ paddingBottom: "20px" }}>{search}</div>
              <div style={{ paddingBottom: "20px" }}>{list}</div>
            </div>
          )}
        </EuiSelectable>
      </EuiPopover>
    </div>
    // <select
    //   className="disease-dropdown"
    //   value={disease} // Set current value of dropdown to state of disease.
    //   onChange={(e) => setDisease(e.target.value)} // Set disease state to selected value when changed.
    //   // style={dropDownStyle}
    // >
    //   {diseases.data.map((item, idx) => {
    //     // Map through diseases and return value and description of each disease
    //     return (
    //       <option
    //         key={item.disease_cases_key}
    //         style={{ textAlign: "center" }}
    //         value={item.disease_cases_key} // Value of each option. A new selection will change the state of disease
    //       >
    //         {item.disease_description}
    //         {/* Disease description. This is what is seen in the box when selected */}
    //       </option>
    //     );
    //   })}
    // </select>
  );
};
