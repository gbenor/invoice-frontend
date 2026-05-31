function CameraUpload({ onFileSelect, file, disabled }) {
  return (
    <div className="card">
      <h2>Upload Invoice</h2>
      <p className="muted">Backend accepts PNG, JPG, and JPEG image files only.</p>
      <label className="label">Take photo (rear camera)</label>
      <input
        type="file"
        accept="image/png,image/jpeg"
        capture="environment"
        disabled={disabled}
        onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
      />

      <label className="label">Or upload image</label>
      <input
        type="file"
        accept="image/png,image/jpeg"
        disabled={disabled}
        onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
      />

      {file ? <p className="muted">Selected: {file.name}</p> : null}
    </div>
  );
}

export default CameraUpload;
