export const Legend = ({ mapTopPos, mapLeftPos }) => {
  const legendItems = [
    { thresholdColor: "#ebebeb", numberOfPeople: 0 },
    { thresholdColor: "#34dbe0", numberOfPeople: 100 },
    { thresholdColor: "#347ce0", numberOfPeople: 10000 },
    { thresholdColor: "#9f37db", numberOfPeople: 50000 },
    { thresholdColor: "#4d15a1", numberOfPeople: 100000 },
    { thresholdColor: "#2c0566", numberOfPeople: 200000 },
  ];
  return (
    <div
      className="legend-container"
      style={{
        // marginLeft: "80vw",
        // marginTop: "60vh",
        top: `${mapTopPos - 345}px`,
        left: `${mapLeftPos - 230}px`,
        width: "200px",
        // backgroundColor: "white",
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
