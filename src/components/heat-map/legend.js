export const Legend = ({ mapTopPos, mapLeftPos, legendItems }) => {
  return (
    <div
      className="legend-container"
      style={{
        top: `${mapTopPos - 345}px`,
        left: `${mapLeftPos - 230}px`,
        width: "200px",
        backgroundColor: "rgba(58, 58, 58, .6)",
        padding: "10px",
        color: "white",
        position: "absolute",
        border: "4px solid #9469d4",
        zIndex: 2,
      }}
    >
      <h3 style={{ textAlign: "center" }}>Disease Cases</h3>
      {legendItems.map((item, idx) => {
        return (
          <p key={`legend-p-item-${idx}`} style={{ paddingBottom: "5px" }}>
            <span
              key={`legend-span-item-${idx}`}
              style={{
                height: "5px",
                paddingTop: "1px",
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingBottom: "1px",
                borderRadius: "20px",
                backgroundColor: item.thresholdColor,
                margin: "10px",
              }}
            ></span>
            <span>{item.numberOfPeople}+</span>
          </p>
        );
      })}
    </div>
  );
};
