import { useEffect, useMemo, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import VersionBadge from './components/VersionBadge';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Result from './pages/Result';
import { clearApiKey, confirmInvoice, getApiKey, getInvoice, getLatestInvoices, setApiKey, updateInvoice, uploadInvoice } from './api/api';

const EDITABLE_FIELDS = ['date', 'merchant', 'total_amount', 'currency', 'expense_type', 'note_from_user', 'llm_summary', 'short_title', 'source'];

function App() {
  const [screen, setScreen] = useState('auth');
  const [apiKey, setStoredApiKey] = useState(() => getApiKey());
  const [authError, setAuthError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [file, setFile] = useState(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceData, setInvoiceData] = useState({});
  const [latestInvoices, setLatestInvoices] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { if (apiKey) setScreen('home'); }, [apiKey]);

  useEffect(() => {
    if (screen !== 'home' && screen !== 'upload') return;
    getLatestInvoices(10).then(setLatestInvoices).catch((error) => {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else setGlobalError(error.message || 'Failed to load recent invoices');
    });
  }, [screen]);

  const previewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  function handleUnauthorized() {
    clearApiKey();
    setStoredApiKey('');
    setAuthError('Unauthorized - invalid key');
    setScreen('auth');
  }

  async function handleUpload() {
    if (!file) return;
    setGlobalError('');
    setUploading(true);
    try {
      const uploadRes = await uploadInvoice(file);
      const id = uploadRes?.invoice_id;
      setInvoiceId(id);
      setInvoiceData({ id, ...(uploadRes?.structured || {}) });
      setScreen('result');
    } catch (error) {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else { setGlobalError(error.message || 'Upload failed'); setScreen('upload'); }
    } finally { setUploading(false); }
  }

  async function openInvoice(id) {
    try {
      const invoice = await getInvoice(id);
      setInvoiceId(id);
      setInvoiceData(invoice);
      setScreen('result');
    } catch (error) {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else setGlobalError(error.message || 'Failed to load invoice');
    }
  }

  async function handleSave() {
    setSaving(true); setGlobalError('');
    try {
      const payload = Object.fromEntries(EDITABLE_FIELDS.map((k) => [k, invoiceData[k]]));
      const updated = await updateInvoice(invoiceId, payload);
      setInvoiceData(updated || invoiceData);
    } catch (error) {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else setGlobalError(error.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function handleConfirm() {
    setConfirming(true); setGlobalError('');
    try {
      const updated = await confirmInvoice(invoiceId);
      setInvoiceData(updated || invoiceData);
      setScreen('home');
      setFile(null);
    } catch (error) {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else setGlobalError(error.message || 'Confirm failed');
    } finally { setConfirming(false); }
  }

  function saveAuthKey(key) {
    const trimmed = key.trim();
    setApiKey(trimmed);
    setStoredApiKey(trimmed);
    setAuthError('');
    setGlobalError('');
    setScreen('home');
  }

  if (screen === 'auth') {
    return (
      <>
        <AuthScreen error={authError} initialKey={apiKey} onContinue={saveAuthKey} />
        <VersionBadge />
      </>
    );
  }

  return (
    <>
      {globalError ? <p className="banner error">{globalError}</p> : null}
      {screen === 'home' ? <Home apiKey={apiKey} onSaveApiKey={saveAuthKey} onScan={() => setScreen('upload')} latestInvoices={latestInvoices} onOpenInvoice={openInvoice} /> : null}
      {screen === 'upload' ? <Upload file={file} previewUrl={previewUrl} onFileSelect={setFile} onUpload={handleUpload} uploading={uploading} /> : null}
      {screen === 'result' ? <Result formData={invoiceData} onChange={(key, value) => setInvoiceData((prev) => ({ ...prev, [key]: value }))} onSave={handleSave} onConfirm={handleConfirm} saving={saving} confirming={confirming} /> : null}
      <VersionBadge />
    </>
  );
}

export default App;
