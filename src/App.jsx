import { useEffect, useMemo, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Result from './pages/Result';
import { confirmInvoice, getApiKey, getInvoice, setApiKey, updateInvoice, uploadInvoice } from './api/api';

const POLL_MAX_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function App() {
  const [screen, setScreen] = useState('auth');
  const [authError, setAuthError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [file, setFile] = useState(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceData, setInvoiceData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (getApiKey()) setScreen('home');
  }, []);

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
    setScreen('processing');
    try {
      const uploadRes = await uploadInvoice(file);
      const id = uploadRes?.id || uploadRes?.invoice_id;
      setInvoiceId(id);
      let invoiceRes = null;

      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
        try {
          invoiceRes = await getInvoice(id);
          break;
        } catch (pollError) {
          if (pollError.code === 401) throw pollError;
          if (attempt === POLL_MAX_ATTEMPTS - 1) throw pollError;
          await sleep(POLL_INTERVAL_MS);
        }
      }

      setInvoiceData(invoiceRes);
      setScreen('result');
    } catch (error) {
      if (error.code === 401) {
        handleUnauthorized();
      } else {
        setGlobalError(error.message || 'Upload failed');
        setScreen('upload');
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setGlobalError('');
    try {
      const updated = await updateInvoice(invoiceId, invoiceData);
      setInvoiceData(updated || invoiceData);
    } catch (error) {
      if (error.code === 401) handleUnauthorized();
      else setGlobalError(error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setGlobalError('');
    try {
      await confirmInvoice(invoiceId);
      setScreen('home');
      setFile(null);
      setInvoiceData({});
      setInvoiceId('');
    } catch (error) {
      if (error.code === 401) handleUnauthorized();
      else setGlobalError(error.message || 'Confirm failed');
    } finally {
      setConfirming(false);
    }
  }

  if (screen === 'auth') {
    return (
      <AuthScreen
        error={authError}
        initialKey={getApiKey()}
        onContinue={(key) => {
          setApiKey(key);
          setAuthError('');
          setScreen('home');
        }}
      />
    );
  }

  return (
    <>
      {globalError ? <p className="banner error">{globalError}</p> : null}
      {screen === 'home' ? <Home onScan={() => setScreen('upload')} /> : null}
      {screen === 'upload' ? (
        <Upload
          file={file}
          previewUrl={previewUrl}
          onFileSelect={setFile}
          onUpload={handleUpload}
          uploading={uploading}
        />
      ) : null}
      {screen === 'processing' ? (
        <main className="container centered">
          <section className="card centered">
            <div className="spinner" />
            <p>Extracting invoice...</p>
          </section>
        </main>
      ) : null}
      {screen === 'result' ? (
        <Result
          formData={invoiceData}
          onChange={(key, value) => setInvoiceData((prev) => ({ ...prev, [key]: value }))}
          onSave={handleSave}
          onConfirm={handleConfirm}
          saving={saving}
          confirming={confirming}
        />
      ) : null}
    </>
  );
}

export default App;
