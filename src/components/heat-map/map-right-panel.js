import { useState, useEffect } from "react";
import { DatePicker } from ".";
export const RightPanel = ({
  title,
  rightPanelInfo,
  rightPanelStartDate,
  setRightPanelStartDate,
  rightPanelEndDate,
  setRightPanelEndDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const date = new Date();
  const dateToISOString = new Date(
    date.setDate(date.getDate() - 2)
  ).toISOString();
  const currentDayStart = dateToISOString.split("T")[0];
  const currentDayEnd = dateToISOString.split("T")[0];
  useEffect(() => {
    title !== currentTitle && title ? setIsOpen(true) : setIsOpen(false);
    setCurrentTitle(title);
  }, [title]);
  return (
    <div
      className="right-panel-container"
      style={
        isOpen
          ? {
              left: "70vw",
            }
          : { left: "100vw" }
      }
    >
      <span
        className="right-panel-open-close"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? ">" : "<"}
      </span>
      <div className="right-panel">
        {title && (
          <>
            <h3 className="county-statistics-title">{title}</h3>
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
              date1={rightPanelStartDate}
              date2={rightPanelEndDate}
              defaultDate={currentDayStart}
              setDate1={setRightPanelStartDate}
              setDate2={setRightPanelEndDate}
            />
          </>
        )}
      </div>
    </div>
  );
};
