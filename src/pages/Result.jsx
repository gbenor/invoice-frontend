import InvoiceForm from '../components/InvoiceForm';

function Result(props) {
  return (
    <main className="container">
      <InvoiceForm {...props} />
    </main>
  );
}

export default Result;
