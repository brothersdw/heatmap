import { useState, useEffect } from "react";
export const RightPanel = ({ title, rightPanelInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
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
              left: "75.5vw",
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
          </>
        )}
      </div>
    </div>
  );
};
