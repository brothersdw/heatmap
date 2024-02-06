import { useEffect, useState } from "react";
export const SlidingPanel = ({
  width = 30,
  color = "#303030",
  children,
  panelClass = "left",
  title = "",
  secondaryPanelSwitch,
  setSecondaryPanelSwitch,
}) => {
  const [isOpen, setIsOpen] = useState(
    panelClass === "left" ? true : secondaryPanelSwitch === true ? true : false
  );

  useEffect(() => {
    typeof secondaryPanelSwitch !== "undefined" &&
      setIsOpen(secondaryPanelSwitch);
  }, [secondaryPanelSwitch, isOpen]);
  if (panelClass !== "left" && panelClass !== "right") {
    console.log(
      `Incorrect "panelClass" for panel. ${panelClass} does not exist for "panelClass" please specify either "left" or "right" for panelClass`
    );
    return;
  }
  return (
    <div
      className={
        panelClass === "left"
          ? "sliding-left-panel-container"
          : "sliding-right-panel-container"
      }
      style={
        panelClass === "left" && isOpen
          ? { width: `${width}vw`, left: "0vw" }
          : panelClass === "left" && !isOpen
          ? { width: `${width}vw`, left: `-${width}vw` }
          : panelClass === "right" && isOpen
          ? { width: `${width}vw`, left: `${100 - width}vw` }
          : { width: `${width}vw`, left: "100vw" }
      }
    >
      <span
        className={
          panelClass === "left"
            ? "sliding-left-panel-open-close"
            : "sliding-right-panel-open-close"
        }
        style={{ backgroundColor: color }}
        onClick={() => {
          setIsOpen(!isOpen);
          typeof secondaryPanelSwitch !== "undefined" &&
            setSecondaryPanelSwitch(!isOpen);
        }}
      >
        {panelClass === "left" && isOpen
          ? "<"
          : panelClass === "left" && !isOpen
          ? ">"
          : panelClass === "right" && isOpen
          ? ">"
          : "<"}
        {/* {isOpen ? ">" : "<"} */}
      </span>
      <div
        className={
          panelClass === "left" ? "sliding-left-panel" : "sliding-right-panel"
        }
        style={{ backgroundColor: color }}
      >
        {title ? (
          <>
            <h3 className="sliding-panel-title">{title}</h3>
            {children}
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
