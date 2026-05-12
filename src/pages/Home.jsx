function Home({ onScan, latestInvoices, onOpenInvoice }) {
  return (
    <main className="container">
      <section className="card">
        <h1>Invoice Frontend</h1>
        <button className="primary large" onClick={onScan}>Scan Invoice</button>
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
