import { EXPENSE_TYPES } from '../api/api';
import { getDateInputValueOrToday } from '../utils/dateInput';

const CURRENCIES = ['GBP', 'EUR', 'ILS', 'USD'];

function InvoiceForm({ formData, onChange, onCancel, onConfirm, confirming }) {
  const textFields = ['merchant', 'total_amount', 'note_from_user', 'llm_summary', 'short_title'];
  const invoiceDate = getDateInputValueOrToday(formData.date);

  return (
    <section className="card">
      <h2>Invoice Details</h2>

      <label className="field">
        <span>date</span>
        <input type="date" value={invoiceDate} onChange={(event) => onChange('date', event.target.value)} />
      </label>

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
