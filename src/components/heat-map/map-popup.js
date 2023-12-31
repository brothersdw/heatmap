export const MapPopup = ({ county, cursorX, cursorY, cases }) => {
  const style = {
    // !IMPORTANT: The left and top is dynamic and based on the states of cursorX and cursorY which are set in the HeatMap component
    left: `${cursorX - (cases ? 80 : 60)}px`,
    top: `${cursorY - (cases ? 85 : 45)}px`,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    position: "absolute",
    padding: "10px",
    borderRadius: "10px",
    zIndex: 2,
  };
  return (
    <div className="popup" style={style}>
      <span>{county}</span>
      {cases && <span>Cases: {cases.cases}</span>}
      {cases && <span>Disease: {cases.disease}</span>}
    </div>
  );
};
