function InvoiceForm({ formData, onChange, onSave, onConfirm, saving, confirming }) {
  const fields = [
    { key: 'date', label: 'Date' },
    { key: 'merchant', label: 'Merchant' },
    { key: 'total_amount', label: 'Total Amount' },
    { key: 'currency', label: 'Currency' },
    { key: 'expense_type', label: 'Expense Type' },
    { key: 'llm_summary', label: 'Summary' }
  ];

  return (
    <section className="card">
      <h2>Invoice Details</h2>
      {fields.map((field) => (
        <label key={field.key} className="field">
          <span>{field.label}</span>
          <input
            type="text"
            value={formData[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            readOnly={field.key === 'llm_summary'}
          />
        </label>
      ))}
      <div className="actions">
        <button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={onConfirm} disabled={confirming}>{confirming ? 'Confirming...' : 'Confirm'}</button>
      </div>
    </section>
  );
}

export default InvoiceForm;
