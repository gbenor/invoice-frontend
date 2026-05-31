import { useEffect, useMemo, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import VersionBadge from './components/VersionBadge';
import Home from './pages/Home';
import TokenUpdate from './pages/TokenUpdate';
import Upload from './pages/Upload';
import Result from './pages/Result';
import { clearApiKey, confirmInvoice, downloadDatabase, getApiKey, getInvoice, getLatestInvoices, setApiKey, updateInvoice, uploadDatabase, uploadInvoice } from './api/api';
import { getDateInputValueOrToday } from './utils/dateInput';

const EDITABLE_FIELDS = ['date', 'merchant', 'total_amount', 'currency', 'expense_type', 'note_from_user', 'llm_summary', 'short_title'];

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
  const [confirming, setConfirming] = useState(false);
  const [downloadingDatabase, setDownloadingDatabase] = useState(false);
  const [uploadingDatabase, setUploadingDatabase] = useState(false);
  const [globalMessage, setGlobalMessage] = useState('');

  useEffect(() => { if (apiKey && screen === 'auth') setScreen('home'); }, [apiKey, screen]);

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
    setGlobalMessage('');
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

  function buildInvoicePayload() {
    return Object.fromEntries(EDITABLE_FIELDS.map((key) => [
      key,
      key === 'date' ? getDateInputValueOrToday(invoiceData[key]) : invoiceData[key]
    ]));
  }

  async function handleConfirm() {
    setConfirming(true); setGlobalError('');
    try {
      await updateInvoice(invoiceId, buildInvoicePayload());
      const updated = await confirmInvoice(invoiceId);
      setInvoiceData(updated || invoiceData);
      setScreen('home');
      setFile(null);
    } catch (error) {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else setGlobalError(error.message || 'Confirm failed');
    } finally { setConfirming(false); }
  }

  function handleCancelResult() {
    setInvoiceId('');
    setInvoiceData({});
    setFile(null);
    setScreen('home');
  }

  async function handleDownloadDatabase() {
    setDownloadingDatabase(true); setGlobalError(''); setGlobalMessage('');
    try {
      await downloadDatabase();
    } catch (error) {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else setGlobalError(error.message || 'Database download failed');
    } finally { setDownloadingDatabase(false); }
  }


  async function refreshLatestInvoices() {
    try {
      setLatestInvoices(await getLatestInvoices(10));
    } catch (error) {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else setGlobalError(error.message || 'Failed to load recent invoices');
    }
  }

  async function handleDatabaseUpload(databaseFile) {
    setUploadingDatabase(true); setGlobalError(''); setGlobalMessage('');
    try {
      const result = await uploadDatabase(databaseFile);
      const serverMessage = typeof result.message === 'string'
        ? result.message
        : result.message?.message || result.message?.status;
      setGlobalMessage(result.downloadedPreviousDatabase
        ? `Database uploaded successfully. Previous database downloaded as ${result.filename}.`
        : serverMessage || 'Database uploaded successfully. No previous database was available to download.');
      await refreshLatestInvoices();
    } catch (error) {
      if (error.code === 401 || error.code === 403) handleUnauthorized();
      else setGlobalError(error.message || 'Database upload failed');
    } finally { setUploadingDatabase(false); }
  }

  function saveAuthKey(key) {
    const trimmed = key.trim();
    setApiKey(trimmed);
    setStoredApiKey(trimmed);
    setAuthError('');
    setGlobalError('');
    setGlobalMessage('');
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
      {globalMessage ? <p className="banner success">{globalMessage}</p> : null}
      {screen === 'home' ? <Home onTokenUpdate={() => setScreen('token')} onDownloadDatabase={handleDownloadDatabase} onDatabaseFileSelect={handleDatabaseUpload} onScan={() => setScreen('upload')} latestInvoices={latestInvoices} onOpenInvoice={openInvoice} downloadingDatabase={downloadingDatabase} uploadingDatabase={uploadingDatabase} /> : null}
      {screen === 'token' ? <TokenUpdate apiKey={apiKey} onBack={() => setScreen('home')} onSaveApiKey={saveAuthKey} /> : null}
      {screen === 'upload' ? <Upload file={file} previewUrl={previewUrl} onFileSelect={setFile} onUpload={handleUpload} uploading={uploading} /> : null}
      {screen === 'result' ? <Result formData={invoiceData} onChange={(key, value) => setInvoiceData((prev) => ({ ...prev, [key]: value }))} onCancel={handleCancelResult} onConfirm={handleConfirm} confirming={confirming} /> : null}
      <VersionBadge />
    </>
  );
}

export default App;
