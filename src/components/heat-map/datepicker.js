import { getCountyMapData } from "../../api/get-counties-mapbox-data";
export const DatePicker = ({
  multiSelect = false,
  maxDate,
  date1,
  date2,
  setDate1,
  setDate2,
  setData1,
  state,
}) => {
  return (
    <div className="date-picker-container">
      {multiSelect ? (
        <div className="date-elements-container">
          <div className="date-element">
            <label className="date-picker-label" htmlFor="start">
              Start:{" "}
            </label>
            <input
              name="start"
              type="date"
              max={date2}
              className="date-picker"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
            />
          </div>
          <div className="date-element">
            <label className="date-picker-label" htmlFor="end">
              End:{" "}
            </label>
            <input
              name="end"
              type="date"
              max={maxDate}
              min={date1}
              className="date-picker"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
            />
          </div>
          {/* <div className="date-element">
            <button>Set Date</button>
          </div> */}
        </div>
      ) : (
        <>
          <div className="date-element">
            <label className="date-picker-label" htmlFor="end">
              Date:{" "}
            </label>
            <input
              name="end"
              type="date"
              max={maxDate}
              className="date-picker"
              placeholder={date1}
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
            />
          </div>
          <div className="date-element">
            <button
              onClick={async () => {
                const currentSetDate = await getCountyMapData(state, date1);
                setData1(currentSetDate.data);
              }}
            >
              Set Date
            </button>
          </div>
        </>
      )}
    </div>
  );
};
