import { useState, useEffect } from "react";
import { DiseaseDropDown, ColorBarLegend, ToggleSwitch } from ".";
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  //   const [genPopSliderPos, setGenPopCasesSliderPos] = useState("slider-left");
  useEffect(() => {
    if (toggleState.label === "Cases" && !toggleState.on) {
      setGenPopSwitch(false);
    }
    if (toggleState.label === "General Population" && !toggleState.on) {
      setCasesSwitch(false);
    }
  });
  return (
    <div
      className="left-panel-container"
      style={
        isOpen
          ? {
              left: "-25vw",
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
          <DiseaseDropDown
            //   mapLeftPos={mapContainerLeft}
            //   mapTopPos={mapContainerBottom}
            disease={disease}
            setDisease={setDisease}
            diseases={diseases}
          />
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
      </div>
    </div>
  );
};
