import { EuiSelectable, EuiPopover, EuiButton } from "@elastic/eui";
import { useState } from "react";
export const SelectDropDown = ({ dropDownOptions, value, setValue }) => {
  const [options, setOptions] = useState(dropDownOptions);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popOverTitle, setPopOverTitle] = useState(value);

  return (
    /* Selection dropdown for various options. The option state is passed down from a component. */
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
  );
};
