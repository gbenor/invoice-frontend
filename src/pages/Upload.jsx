import CameraUpload from '../components/CameraUpload';

function Upload({ file, onFileSelect, onUpload, uploading, previewUrl }) {
  return (
    <main className="container">
      <CameraUpload onFileSelect={onFileSelect} file={file} disabled={uploading} />
      {previewUrl ? (
        <section className="card">
          <h3>Preview</h3>
          <img src={previewUrl} alt="Invoice preview" className="preview" />
        </section>
      ) : null}
      {uploading ? (
        <section className="card processing-card" aria-live="polite" aria-busy="true">
          <div className="spinner" aria-hidden="true" />
          <h3>Processing invoice…</h3>
          <p className="muted">Uploading and extracting invoice details. This can take a moment.</p>
        </section>
      ) : null}
      <button className="primary" onClick={onUpload} disabled={!file || uploading}>
        {uploading ? 'Processing invoice…' : 'Upload'}
      </button>
    </main>
  );
}

export default Upload;
