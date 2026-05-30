import { useState } from 'react';

function AuthScreen({ initialKey = '', onContinue, error }) {
  const [key, setKey] = useState(initialKey);

  function handleSubmit(event) {
    event.preventDefault();
    if (!key.trim()) return;
    onContinue(key.trim());
  }

  return (
    <main className="container centered">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Invoice Scanner</h1>
        <p>Enter the backend API key for invoice-production-a0d7.up.railway.app. The app sends it as an api_key query parameter to avoid browser CORS preflight failures.</p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Backend API key"
          autoComplete="off"
        />
        {error ? <p className="error">{error}</p> : null}
        <button type="submit">Save and continue</button>
      </form>
    </main>
  );
}

export default AuthScreen;
