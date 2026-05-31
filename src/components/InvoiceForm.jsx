import { EXPENSE_TYPES } from '../api/api';

const CURRENCIES = ['GBP', 'EUR', 'ILS', 'USD'];

function InvoiceForm({ formData, onChange, onCancel, onConfirm, confirming }) {
  const textFields = ['date', 'merchant', 'total_amount', 'note_from_user', 'llm_summary', 'short_title'];

  return (
    <section className="card">
      <h2>Invoice Details</h2>

      {textFields.map((key) => (
        <label key={key} className="field">
          <span>{key}</span>
          <input type="text" value={formData[key] || ''} onChange={(event) => onChange(key, event.target.value)} />
        </label>
      ))}

      <label className="field">
        <span>currency</span>
        <select value={formData.currency || ''} onChange={(event) => onChange('currency', event.target.value)}>
          {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
        </select>
      </label>

      <label className="field">
        <span>expense_type</span>
        <select value={formData.expense_type || 'other'} onChange={(event) => onChange('expense_type', event.target.value)}>
          {EXPENSE_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>

      <div className="actions">
        <button type="button" className="secondary" onClick={onCancel} disabled={confirming}>Cancel</button>
        <button type="button" onClick={onConfirm} disabled={confirming}>{confirming ? 'Confirming...' : 'Confirm'}</button>
      </div>
    </section>
  );
}

export default InvoiceForm;
