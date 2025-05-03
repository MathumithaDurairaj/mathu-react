import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import './ProductPage.css';

// Debounce Hook
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const ErrorComponent = memo(() => {
  return (
    <div className="error-container">
      <h2>Error Loading Products</h2>
      <p>Failed to load products. Please try again.</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  )
});

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error'

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setStatus('loading');
      try {
        const res = await fetch('https://fakestoreapi.com/products');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setProducts(data);
        setStatus('idle');
      } catch (err) {
        setStatus('error')
      }
    };

    fetchProducts();
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Categories
  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category))];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return products.filter((product) => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch =
        !debouncedSearch ||
        product.title.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [debouncedSearch, selectedCategory, products]);

  // Total price
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  }, [cart]);

  // Add to cart
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Product card
  const renderProductCard = useCallback(
    (product) => (
      <div key={product.id} className="product-card">
        <img src={product.image} alt={product.title} loading="lazy" />
        <h3>{product.title}</h3>
        <p>${product.price}</p>
        <button onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    ),
    [addToCart]
  );

  // Cart item
  const renderCartItem = useCallback(
    (item) => (
      <div key={item.id} className="cart-item">
        <span>
          {item.title} x {item.quantity}
        </span>
        <span>${(item.price * item.quantity).toFixed(2)}</span>
        <button onClick={() => removeFromCart(item.id)}>Remove</button>
      </div>
    ),
    [removeFromCart]
  );

  // Skeleton
  const renderLoadingSkeleton = () => (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="product-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-title"></div>
          <div className="skeleton-price"></div>
          <div className="skeleton-button"></div>
        </div>
      ))}
    </div>
  );

  if (status === 'error') {
    return (
      <ErrorComponent />
    );
  }

  return (
    <div className="product-page">
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {status === 'loading' ? (
        renderLoadingSkeleton()
      ) : (
        <div className="product-grid">{filteredProducts.map(renderProductCard)}</div>
      )}

      {/* Shopping Cart */}
      <div className="cart">
        <h2>Shopping Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            {cart.map(renderCartItem)}
            <div className="cart-total">
              <strong>Total: ${cartTotal}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPage;