// DataBox component
export const DataBox = ({ lng, lat, county, cases, zoom }) => {
  return (
    <div className="data-box" style={{ zIndex: 2 }}>
      <p>Longitude: {lng}</p>
      <p>Latitude: {lat}</p>
      <p style={{ marginRight: "50px" }}>Zoom: {zoom}</p>
      <p>County: {county}</p>
      {/* If cases exist show number of cases else show 0 */}
      <p>Cases: {cases ? cases.cases : 0}</p>{" "}
    </div>
  );
};
