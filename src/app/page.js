export default function Home() {
  const code = `def prepare_data(oecdBli, gdpPerCapita):
    oecdBli = oecdBli.set_index('Country')
    gdpPerCapita = gdpPerCapita.set_index('COUNTRY')
    gdpPerCapita = gdpPerCapita.rename(columns={'2025': 'GDP per capita'})
    gdpPerCapita = gdpPerCapita[['GDP per capita']]
    oecdBli = oecdBli[oecdBli['Indicator'] == "Life satisfaction"]
    oecdBli = oecdBli[['OBS_VALUE']]
    fullStats = gdpPerCapita.join(oecdBli, how='inner')
    fullStats = fullStats.rename(columns={'OBS_VALUE': 'Life satisfaction'})
    return fullStats`;

  return (
    <main className="page-wrap">
      <div className="left">
        <div className="preview-card">
          <div className="window">
            <div className="traffic">
              <div className="dot red" />
              <div className="dot yellow" />
              <div className="dot green" />
            </div>
            <pre className="code-sample">{code}</pre>
          </div>
        </div>
      </div>

      <aside className="right">
        <div className="section-title">Customize</div>

        <details className="accordion" open>
          <summary>Presets</summary>
          <div className="accordion-body">
            <div className="preset-row">
              <button className="btn ghost">Default</button>
              <button className="btn ghost">Dark</button>
            </div>
            <div className="preset-row">
              <button className="btn ghost">Code</button>
              <button className="btn ghost">Presentation</button>
            </div>
          </div>
        </details>

        <details className="accordion">
          <summary>Canvas</summary>
          <div className="accordion-body">
            <label className="field">
              <div className="field-label">Width</div>
              <input type="range" min="400" max="2000" defaultValue="1200" />
            </label>
            <label className="field">
              <div className="field-label">Height</div>
              <input type="range" min="200" max="1600" defaultValue="720" />
            </label>
          </div>
        </details>

        <details className="accordion">
          <summary>Colors</summary>
          <div className="accordion-body">
            <div className="swatches">
              <button className="swatch" style={{background:'#2f1b5b'}} />
              <button className="swatch" style={{background:'#6b46c1'}} />
              <button className="swatch" style={{background:'#8a2be2'}} />
              <button className="swatch" style={{background:'#00d4b4'}} />
            </div>
            <div className="field">
              <div className="field-label">Background</div>
              <input type="color" defaultValue="#0b0b0b" />
            </div>
          </div>
        </details>

        <details className="accordion">
          <summary>Export</summary>
          <div className="accordion-body">
            <button className="btn primary" style={{width:'100%'}}>Export PNG</button>
            <button className="btn ghost" style={{width:'100%', marginTop:8}}>Export Glyph</button>
          </div>
        </details>

      </aside>
    </main>
  );
}
