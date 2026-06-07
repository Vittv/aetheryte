function CurrentContent() {
  return (
    <>
      <h2 className="current-header">Current</h2>
      <section className="current-content">
        <div className="current-ultimate">
          <h3>Ultimate</h3>
          <p>Dancing Mad</p>
          <button type="button">View Guide →</button>
        </div>

        <div className="current-savage">
          <h3>Savage</h3>
          <p>Arcadion: M9S-M12s</p>
          <button type="button">View Guide →</button>
        </div>

        <div className="current-extreme">
          <h3>Extreme</h3>
          <p>Enuo</p>
          <button type="button">View Guide →</button>
        </div>
      </section>
    </>
  );
}

export default CurrentContent;
