function formatDateTime(value) {
  if (!value) return 'Unknown date';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function formatTotal(invoice) {
  const amount = invoice.total_amount ?? invoice.total ?? invoice.total_sum;
  const currency = invoice.currency || '';

  if (amount === undefined || amount === null || amount === '') return 'Total unavailable';

  return `${currency ? `${currency} ` : ''}${amount}`;
}

function Home({
  onScan,
  onTokenUpdate,
  onDownloadDatabase,
  onDatabaseFileSelect,
  latestInvoices,
  onOpenInvoice,
  downloadingDatabase,
  uploadingDatabase
}) {
  const databaseActionBusy = downloadingDatabase || uploadingDatabase;
  return (
    <main className="container">
      <section className="card">
        <h1>Invoice Frontend</h1>
        <p className="muted">Connected to invoice-production-a0d7.up.railway.app</p>
        <button className="primary large" onClick={onScan}>Scan Invoice</button>
      </section>

      <section className="card">
        <h3>Settings</h3>
        <button type="button" className="secondary" onClick={onTokenUpdate}>Update Token</button>
        <button type="button" className="secondary" onClick={onDownloadDatabase} disabled={databaseActionBusy}>
          {downloadingDatabase ? 'Preparing download...' : 'Download Database'}
        </button>
        <label className={`button-like secondary${databaseActionBusy ? ' disabled' : ''}`} aria-disabled={databaseActionBusy}>
          <span>{uploadingDatabase ? 'Uploading database...' : 'DB Upload'}</span>
          <input
            type="file"
            className="visually-hidden"
            accept=".db,.sqlite,.sqlite3,application/vnd.sqlite3,application/x-sqlite3"
            disabled={databaseActionBusy}
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              event.target.value = '';
              if (selectedFile) onDatabaseFileSelect(selectedFile);
            }}
          />
        </label>
      </section>

      <section className="card">
        <h3>Recent invoices</h3>
        {latestInvoices?.length ? latestInvoices.map((inv) => (
          <button key={inv.id} className="invoice-list-item" onClick={() => onOpenInvoice(inv.id)}>
            <span className="invoice-list-item__date">{formatDateTime(inv.date || inv.created_at || inv.uploaded_at)}</span>
            <span className="invoice-list-item__merchant">{inv.merchant || 'Unknown merchant'}</span>
            <span className="invoice-list-item__total">{formatTotal(inv)}</span>
            <span className="invoice-list-item__summary">{inv.llm_summary || 'No LLM summary available.'}</span>
          </button>
        )) : <p className="muted">No recent invoices.</p>}
      </section>
    </main>
  );
}

export default Home;
