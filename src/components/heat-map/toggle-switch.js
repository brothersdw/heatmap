export const ToggleSwitch = ({
  toggleSwitch,
  setToggleSwitch,
  setToggleState,
  switchLabel,
}) => {
  return (
    <div className="switchContainer">
      <span className="switch-label">
        <h4>{switchLabel}</h4>
      </span>
      <div
        className={`switch ${toggleSwitch ? "switch-green" : "switch-red"}`}
        onClick={() => {
          setToggleSwitch(!toggleSwitch);
          setToggleState({ label: switchLabel, on: toggleSwitch });
        }}
      >
        <span
          className={`slider ${toggleSwitch ? "slider-right" : "slider-left"}`}
        ></span>
      </div>
    </div>
  );
};
