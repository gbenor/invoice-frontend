import CameraUpload from '../components/CameraUpload';

function Upload({ file, onFileSelect, onUpload, uploading, previewUrl, credits, creditsError }) {
  return (
    <main className="container">
      <CameraUpload onFileSelect={onFileSelect} file={file} />
      <section className="card">
        <h3>LLM Credits</h3>
        {creditsError ? <p className="muted">Credits unavailable right now.</p> : <pre>{JSON.stringify(credits || {}, null, 2)}</pre>}
      </section>
      {previewUrl ? (
        <section className="card">
          <h3>Preview</h3>
          {file?.type === 'application/pdf' ? (
            <p className="muted">PDF selected: {file.name}</p>
          ) : (
            <img src={previewUrl} alt="Invoice preview" className="preview" />
          )}
        </section>
      ) : null}
      <button className="primary" onClick={onUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </main>
  );
}

export default Upload;
