import { useState } from 'react';

function Home({ apiKey, onSaveApiKey, onScan, latestInvoices, onOpenInvoice }) {
  const [draftKey, setDraftKey] = useState(apiKey || '');

  function handleAuthSubmit(event) {
    event.preventDefault();
    onSaveApiKey(draftKey);
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Invoice Frontend</h1>
        <p className="muted">Connected to invoice-production-a0d7.up.railway.app</p>
        <button className="primary large" onClick={onScan}>Scan Invoice</button>
      </section>

      <section className="card">
        <h3>API authentication</h3>
        <p className="muted">Enter the backend API key. It is saved in this browser and sent as an api_key query parameter so cross-origin GETs and file uploads do not trigger CORS OPTIONS preflights.</p>
        <form onSubmit={handleAuthSubmit}>
          <label className="field">
            <span>Auth key</span>
            <input
              type="password"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="Backend API key"
              autoComplete="off"
            />
          </label>
          <button type="submit">Save auth key</button>
        </form>
      </section>

      <section className="card">
        <h3>Recent invoices</h3>
        {latestInvoices?.length ? latestInvoices.map((inv) => (
          <button key={inv.id} className="secondary" onClick={() => onOpenInvoice(inv.id)}>
            {inv.id} • {inv.merchant || 'Unknown'} • {inv.status}
          </button>
        )) : <p className="muted">No recent invoices.</p>}
      </section>
    </main>
  );
}

export default Home;
