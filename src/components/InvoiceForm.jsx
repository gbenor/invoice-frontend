import { EXPENSE_TYPES, SOURCE_VALUES, STATUS_VALUES } from '../api/api';

function InvoiceForm({ formData, onChange, onSave, onConfirm, saving, confirming }) {
  return (
    <section className="card">
      <h2>Invoice Details</h2>

      <label className="field">
        <span>ID</span>
        <input type="text" value={formData.id || ''} readOnly />
      </label>

      <label className="field">
        <span>Status</span>
        <select value={formData.status || 'draft'} onChange={(e) => onChange('status', e.target.value)}>
          {STATUS_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      {['date', 'merchant', 'total_amount', 'currency', 'note_from_user', 'llm_summary', 'short_title'].map((key) => (
        <label key={key} className="field">
          <span>{key}</span>
          <input type="text" value={formData[key] || ''} onChange={(e) => onChange(key, e.target.value)} />
        </label>
      ))}

      <label className="field">
        <span>expense_type</span>
        <select value={formData.expense_type || 'other'} onChange={(e) => onChange('expense_type', e.target.value)}>
          {EXPENSE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      <label className="field">
        <span>source</span>
        <select value={formData.source || 'camera_invoice'} onChange={(e) => onChange('source', e.target.value)}>
          {SOURCE_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      <div className="actions">
        <button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={onConfirm} disabled={confirming}>{confirming ? 'Confirming...' : 'Confirm'}</button>
      </div>
    </section>
  );
}

export default InvoiceForm;
