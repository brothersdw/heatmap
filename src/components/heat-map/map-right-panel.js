import { useState, useEffect } from "react";
import { DatePicker, SlidingPanel, LineChart } from ".";
export const RightPanel = ({
  title,
  rightPanelInfo,
  rightPanelStartDate,
  setRightPanelStartDate,
  rightPanelEndDate,
  setRightPanelEndDate,
  county,
  disease,
  currentSwitch,
  countyMapData,
  state,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const date = new Date();
  const dateToISOString = new Date(date.setDate(date.getDate())).toISOString();
  const currentDayStart = dateToISOString.split("T")[0];
  const currentDayEnd = dateToISOString.split("T")[0];
  useEffect(() => {
    title !== currentTitle && title ? setIsOpen(true) : setIsOpen(false);
    setCurrentTitle(title);
    console.log("right panel open: ", isOpen);
  }, [title]);
  return (
    <SlidingPanel
      panelClass="right"
      title={title}
      secondaryPanelSwitch={isOpen}
      setSecondaryPanelSwitch={setIsOpen}
    >
      {title && (
        <>
          {Object.keys(rightPanelInfo).map((r, idx) => {
            if (r !== "components") {
              return (
                <p className="county-stat" key={`stat-${idx}`}>
                  <strong>{r}:</strong> {rightPanelInfo[r]}
                </p>
              );
            } else {
              return rightPanelInfo[r].map((component) => {
                return component;
              });
            }
          })}
          <DatePicker
            multiSelect
            maxDate={currentDayStart}
            date1={rightPanelStartDate}
            date2={rightPanelEndDate}
            setDate1={setRightPanelStartDate}
            setDate2={setRightPanelEndDate}
          />
          {rightPanelInfo && county ? (
            <LineChart
              countyMapData={countyMapData}
              currentSwitch={currentSwitch}
              disease={disease}
              county={county}
              filter={rightPanelInfo}
              chartTitle={title}
              startDate={rightPanelStartDate}
              endDate={rightPanelEndDate}
              state={state}
            />
          ) : (
            <div style={{ color: "white", zIndex: 2 }}>Loading Graph...</div>
          )}
        </>
      )}
    </SlidingPanel>
  );
};
