// import "./heat-map";
export const ColorBarLegend = ({ rangeNum1, rangeNum2, colors, title }) => {
  const gradientColors = colors;
  let colorString;
  gradientColors.forEach((color) => {
    colorString = colorString ? colorString + `, ${color}` : color;
  });
  const style = {
    background: `linear-gradient(
            to right,
            ${colorString}
          )`,
  };
  return (
    <div className="color-bar-legend-container">
      <h3 className="color-bar-title">{title}</h3>
      <span className="color-bar-legend" style={style}></span>
      <span className="legend-num1">{rangeNum1}</span>
      <span className="legend-num2">{rangeNum2}</span>
    </div>
  );
};
