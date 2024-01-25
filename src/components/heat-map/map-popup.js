export const MapPopup = ({ cursorX, cursorY, popupValuesObj }) => {
  const style = {
    // !IMPORTANT: The left and top is dynamic and based on the states of cursorX and cursorY which are set in the HeatMap component
    left: `${cursorX - (popupValuesObj ? 80 : 60)}px`,
    top: `${cursorY - (popupValuesObj ? 85 : 45)}px`,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    position: "absolute",
    padding: "10px",
    borderRadius: "10px",
    zIndex: 2,
  };
  return (
    <div className="popup" style={style}>
      {/* {cases && <span>Cases: {cases.cases}</span>}
      {cases && <span>Disease: {cases.disease}</span>} */}
      {Object.keys(popupValuesObj).map((ok, idx) => {
        return (
          <span key={`ok-${idx}`}>
            {ok}: {popupValuesObj[ok]}
          </span>
        );
      })}
    </div>
  );
};
