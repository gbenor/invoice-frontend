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
        <p>Enter access key</p>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Access key"
          autoComplete="off"
        />
        {error ? <p className="error">{error}</p> : null}
        <button type="submit">Continue</button>
      </form>
    </main>
  );
}

export default AuthScreen;
