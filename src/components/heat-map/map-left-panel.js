import { useState, useEffect } from "react";
import { SelectDropDown, ColorBarLegend, ToggleSwitch, DatePicker } from ".";
export const LeftPanel = ({
  zoom,
  disease,
  diseases,
  setDisease,
  casesSwitch,
  setCasesSwitch,
  toggleState,
  setToggleState,
  genPopSwitch,
  setGenPopSwitch,
  genPopPerSwitch,
  setGenPopPerSwitch,
  leftPanelDate,
  setLeftPanelDate,
  setData1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  //   const [genPopSliderPos, setGenPopCasesSliderPos] = useState("slider-left");
  const date = new Date();
  const dateToISOString = new Date(
    date.setDate(date.getDate() - 2)
  ).toISOString();
  const currentDayStart = dateToISOString.split("T")[0];
  const currentDayEnd = dateToISOString.split("T")[0];
  useEffect(() => {
    if (toggleState.label === "Cases" && !toggleState.on) {
      setGenPopSwitch(false);
      setGenPopPerSwitch(false);
    }
    if (toggleState.label === "General Population" && !toggleState.on) {
      setCasesSwitch(false);
      setGenPopPerSwitch(false);
    }
    if (
      toggleState.label === "General Population Percentage" &&
      !toggleState.on
    ) {
      setCasesSwitch(false);
      setGenPopSwitch(false);
      // setGenPopPerSwitch(true);
    }
  });
  const dropDownOptions = diseases.data.map((item, idx) => {
    // Map through diseases and return value and description of each disease
    return {
      label: item.disease_description,
      value: item.disease_cases_key,
    };
  });

  const dropDownValue = dropDownOptions.filter((d) => d.value === disease)[0]
    .label;

  return (
    <div
      className="left-panel-container"
      style={
        isOpen
          ? {
              left: "-30vw",
            }
          : { left: "0" }
      }
    >
      <span
        className="left-panel-open-close"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? ">" : "<"}
      </span>
      <div className="left-panel">
        <ToggleSwitch
          switchLabel={"Cases"}
          setToggleState={setToggleState}
          toggleSwitch={casesSwitch}
          setToggleSwitch={setCasesSwitch}
        />
        {casesSwitch && (
          <>
            <DatePicker
              date1={leftPanelDate}
              setDate1={setLeftPanelDate}
              setData1={setData1}
              defaultDate={currentDayStart}
            />
            <SelectDropDown
              setValue={setDisease}
              value={dropDownValue}
              dropDownOptions={dropDownOptions}
            />
          </>
        )}
        {casesSwitch ? (
          zoom > 4.7 ? (
            <ColorBarLegend
              rangeNum1={"0"}
              rangeNum2={"200,000+"}
              title={"Disease Cases"}
              colors={[
                "#ebebeb",
                "#34dbe0",
                "#347ce0",
                "#9f37db",
                "#4d15a1",
                "#2c0566",
              ]}
            />
          ) : (
            <ColorBarLegend
              rangeNum1={"0"}
              rangeNum2={"8,000,000+"}
              title={"Disease Cases"}
              colors={[
                "#ebebeb",
                "#34dbe0",
                "#347ce0",
                "#9f37db",
                "#4d15a1",
                "#2c0566",
              ]}
            />
          )
        ) : null}
        <ToggleSwitch
          switchLabel={"General Population"}
          setToggleState={setToggleState}
          toggleSwitch={genPopSwitch}
          setToggleSwitch={setGenPopSwitch}
        />
        {genPopSwitch ? (
          zoom > 4.7 ? (
            <ColorBarLegend
              rangeNum1={"0"}
              rangeNum2={"500,000+"}
              title={"General Population"}
              colors={[
                "#f2ffa5",
                "#c1f53f",
                "#52cd19",
                "#0a9518",
                "#084924",
                "#063a0b",
              ]}
            />
          ) : (
            <ColorBarLegend
              rangeNum1={"0"}
              rangeNum2={"50,000,000+"}
              title={"General Population"}
              colors={[
                "#f2ffa5",
                "#c1f53f",
                "#52cd19",
                "#0a9518",
                "#084924",
                "#063a0b",
              ]}
            />
          )
        ) : null}
        <ToggleSwitch
          switchLabel={"General Population Percentage"}
          setToggleState={setToggleState}
          toggleSwitch={genPopPerSwitch}
          setToggleSwitch={setGenPopPerSwitch}
        />
        {genPopPerSwitch ? (
          zoom > 4.7 ? (
            <ColorBarLegend
              rangeNum1={"0"}
              rangeNum2={"100%"}
              title={"General Population Percentage"}
              colors={["#fff702", "#ff4a0e"]}
            />
          ) : (
            <ColorBarLegend
              rangeNum1={"0"}
              rangeNum2={"100%"}
              title={"General Population Percentage"}
              colors={["#fff702", "#ff4a0e"]}
            />
          )
        ) : null}
      </div>
    </div>
  );
};
