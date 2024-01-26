import { EuiSelectable, EuiPopover, EuiButton } from "@elastic/eui";
import { useState } from "react";
// import "./select-dropdown-css.css";
export const SelectDropDown = ({
  // Grabbing props from HeatMap component
  dropDownOptions,
  value,
  setValue,
}) => {
  const [options, setOptions] = useState(dropDownOptions);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popOverTitle, setPopOverTitle] = useState(value);

  return (
    /* Selection dropdown for various diseases. The disease state is passed down from the HeatMap component
           and must stay there as it reloads the HeatMap based on the disease state. */

    <div className="select-dropdown-container">
      <EuiPopover
        className="select-popover"
        panelPaddingSize="none"
        button={
          <EuiButton
            style={{
              textDecoration: "none",
            }}
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
          className="select-options"
          aria-label="Searchable Dropdown"
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
          singleSelection
          searchProps={{
            label: "",
          }}
        >
          {(list, search) => (
            <div className="search-list-container">
              <div className="search-container">{search}</div>
              <div className="list-items">{list}</div>
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
