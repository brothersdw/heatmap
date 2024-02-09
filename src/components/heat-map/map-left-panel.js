import { useState, useEffect } from "react";
import {
  SelectDropDown,
  ColorBarLegend,
  ToggleSwitch,
  DatePicker,
  SlidingPanel,
} from ".";
export const LeftPanel = ({
  zoom,
  disease,
  diseases,
  setDisease,
  caseInfoSwitch,
  setCaseInfoSwitch,
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
  const [isOpen, setIsOpen] = useState(true);
  const date = new Date();
  const dateToISOString = new Date(date.setDate(date.getDate())).toISOString();
  const currentDayStart = dateToISOString.split("T")[0];
  const currentDayEnd = dateToISOString.split("T")[0];
  useEffect(() => {
    if (toggleState.label === "Case Information" && !toggleState.on) {
      setGenPopSwitch(false);
    }
    if (toggleState.label === "Case Information" && toggleState.on) {
      setCasesSwitch(false);
      setGenPopPerSwitch(false);
    }
    if (toggleState.label === "Cases" && !toggleState.on) {
      setGenPopSwitch(false);
      setGenPopPerSwitch(false);
    }
    if (toggleState.label === "General Population" && !toggleState.on) {
      setCasesSwitch(false);
      setGenPopPerSwitch(false);
      setCaseInfoSwitch(false);
    }
    if (
      toggleState.label === "Case Percentage of General Population" &&
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
    <SlidingPanel>
      <ToggleSwitch
        switchLabel={"Case Information"}
        setToggleState={setToggleState}
        toggleSwitch={caseInfoSwitch}
        setToggleSwitch={setCaseInfoSwitch}
      />
      {caseInfoSwitch && (
        <div className="case-info-container">
          <div className="left-panel-child-switch">
            <ToggleSwitch
              switchLabel={"Cases"}
              setToggleState={setToggleState}
              toggleSwitch={casesSwitch}
              setToggleSwitch={setCasesSwitch}
            />
          </div>
          {casesSwitch && (
            <>
              <DatePicker
                date1={leftPanelDate}
                setDate1={setLeftPanelDate}
                setData1={setData1}
                maxDate={currentDayStart}
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
          <div className="left-panel-child-switch">
            <ToggleSwitch
              switchLabel={"Case Percentage of General Population"}
              setToggleState={setToggleState}
              toggleSwitch={genPopPerSwitch}
              setToggleSwitch={setGenPopPerSwitch}
            />
          </div>
          {genPopPerSwitch && (
            <>
              <DatePicker
                date1={leftPanelDate}
                setDate1={setLeftPanelDate}
                setData1={setData1}
                maxDate={currentDayStart}
              />
              <SelectDropDown
                setValue={setDisease}
                value={dropDownValue}
                dropDownOptions={dropDownOptions}
              />
            </>
          )}
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
      )}
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
    </SlidingPanel>
  );
};
