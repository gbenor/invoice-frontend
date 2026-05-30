import CameraUpload from '../components/CameraUpload';

function Upload({ file, onFileSelect, onUpload, uploading, previewUrl }) {
  return (
    <main className="container">
      <CameraUpload onFileSelect={onFileSelect} file={file} />
      {previewUrl ? (
        <section className="card">
          <h3>Preview</h3>
          <img src={previewUrl} alt="Invoice preview" className="preview" />
        </section>
      ) : null}
      <button className="primary" onClick={onUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </main>
  );
}

export default Upload;
