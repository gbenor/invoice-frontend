import { useEffect, useMemo, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Result from './pages/Result';
import { confirmInvoice, getApiKey, getCredits, getInvoice, getLatestInvoices, setApiKey, updateInvoice, uploadInvoice } from './api/api';

const EDITABLE_FIELDS = ['date', 'merchant', 'total_amount', 'currency', 'expense_type', 'note_from_user', 'llm_summary', 'short_title', 'source'];

function App() {
  const [screen, setScreen] = useState('auth');
  const [authError, setAuthError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [file, setFile] = useState(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceData, setInvoiceData] = useState({});
  const [latestInvoices, setLatestInvoices] = useState([]);
  const [credits, setCredits] = useState(null);
  const [creditsError, setCreditsError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { if (getApiKey()) setScreen('home'); }, []);

  useEffect(() => {
    if (screen !== 'home' && screen !== 'upload') return;
    getLatestInvoices(10).then(setLatestInvoices).catch(() => {});
    getCredits().then((v) => { setCredits(v); setCreditsError(false); }).catch(() => setCreditsError(true));
  }, [screen]);

  const previewUrl = useMemo(() => {
    if (!file || file.type === 'application/pdf') return '';
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  function handleUnauthorized() {
    localStorage.removeItem('invoice_api_key');
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
      if (error.code === 401) handleUnauthorized();
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
      setGlobalError(error.message || 'Failed to load invoice');
    }
  }

  async function handleSave() {
    setSaving(true); setGlobalError('');
    try {
      const payload = Object.fromEntries(EDITABLE_FIELDS.map((k) => [k, invoiceData[k]]));
      const updated = await updateInvoice(invoiceId, payload);
      setInvoiceData(updated || invoiceData);
    } catch (error) {
      if (error.code === 401) handleUnauthorized();
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
      if (error.code === 401) handleUnauthorized();
      else setGlobalError(error.message || 'Confirm failed');
    } finally { setConfirming(false); }
  }

  if (screen === 'auth') return <AuthScreen error={authError} initialKey={getApiKey()} onContinue={(key) => { setApiKey(key); setAuthError(''); setScreen('home'); }} />;

  return (
    <>
      {globalError ? <p className="banner error">{globalError}</p> : null}
      {screen === 'home' ? <Home onScan={() => setScreen('upload')} latestInvoices={latestInvoices} onOpenInvoice={openInvoice} /> : null}
      {screen === 'upload' ? <Upload file={file} previewUrl={previewUrl} onFileSelect={setFile} onUpload={handleUpload} uploading={uploading} credits={credits} creditsError={creditsError} /> : null}
      {screen === 'result' ? <Result formData={invoiceData} onChange={(key, value) => setInvoiceData((prev) => ({ ...prev, [key]: value }))} onSave={handleSave} onConfirm={handleConfirm} saving={saving} confirming={confirming} /> : null}
    </>
  );
}

export default App;
