export const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-elements-container">
        <div className="loading-icon-container">
          <span className="loading-shard loading-shard-1"></span>
          <span className="loading-shard loading-shard-2"></span>
          <span className="loading-shard loading-shard-3"></span>
          <span className="loading-shard loading-shard-4"></span>
          <span className="loading-shard loading-shard-5"></span>
          <span className="loading-shard loading-shard-6"></span>
          <span className="loading-shard loading-shard-7"></span>
          <span className="loading-shard loading-shard-8"></span>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};
