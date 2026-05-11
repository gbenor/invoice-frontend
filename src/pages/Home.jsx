function Home({ onScan }) {
  return (
    <main className="container centered">
      <section className="card">
        <h1>Invoice Frontend</h1>
        <button className="primary large" onClick={onScan}>Scan Invoice</button>
      </section>
    </main>
  );
}

export default Home;
