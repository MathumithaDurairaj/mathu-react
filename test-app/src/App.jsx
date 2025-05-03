import './App.css'
import Dashboard from './Components /Dashboard'
import ProductPage from './Components /ProductPage';

function App() {
  const apiEndpoint = 'https://fakestoreapi.com/products';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <ProductPage /> */}
      <Dashboard apiEndpoint={apiEndpoint} />
    </div>
  )
}

export default App;
