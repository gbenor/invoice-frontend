function CameraUpload({ onFileSelect, file }) {
  return (
    <div className="card">
      <h2>Upload Invoice</h2>
      <label className="label">Take photo (rear camera)</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
      />

      <label className="label">Or upload PDF / image</label>
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
      />

      {file ? <p className="muted">Selected: {file.name}</p> : null}
    </div>
  );
}

export default CameraUpload;
