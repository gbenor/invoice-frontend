import { useState } from 'react';

function TokenUpdate({ apiKey, onBack, onSaveApiKey }) {
  const [draftKey, setDraftKey] = useState(apiKey || '');

  function handleSubmit(event) {
    event.preventDefault();
    onSaveApiKey(draftKey);
  }

  return (
    <main className="container">
      <section className="card">
        <button className="link-button" type="button" onClick={onBack}>← Back to home</button>
        <h1>Update Token</h1>
        <p className="muted">
          Enter the backend API key. It is saved in this browser and sent as an Authorization: Bearer token on every backend request.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Auth key</span>
            <input
              type="password"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="Backend API key"
              autoComplete="off"
            />
          </label>
          <button type="submit">Save auth key</button>
        </form>
      </section>
    </main>
  );
}

export default TokenUpdate;
