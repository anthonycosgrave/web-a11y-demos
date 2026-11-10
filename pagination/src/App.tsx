import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import './App.css'

// dummyjson.com product
type Product = {
  id: number;
  title: string;
  thumbnail: string;
};

const PRODUCTS_PER_PAGE = 12;
const MAX_PAGE_LINKS = 10;
const LINKS_BEFORE_CURRENT = 5;

// Google search style where upto 10 pages are shown e.g. if 20 pages of
// results exist. If user navigates to page 7 of 10, the page "window"
// updates to show pages 2 to 11, 3 to 12, and so forth until no more 
// pages are available.
function getPageWindow(current: number, totalPages: number): number[] {
  const first = Math.max(1, current - LINKS_BEFORE_CURRENT);
  const last = Math.min(totalPages, first + MAX_PAGE_LINKS - 1);
  return Array.from({ length: last - first + 1 }, (_, i) => first + i);
}

// The page number lives in the URL (?page=N), not in React state, so the address bar,
// Back/Forward and shared links always agree (one source of truth).
// Missing or invalid values fall back to page 1 (GOV.UK redirects to page 1).
function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams] = useSearchParams();
  const pageNumber = parsePage(searchParams.get('page'));
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const didUserChangePage = useRef(false);

  // Set when the user activates a pagination link; the focus effect reads it so focus only moves
  // after a page change, never on first load.
  //
  // GitHub Primer: when content changes without a reload, move focus to the start of the new content. 
  // (eBay says the opposite for client-side pagination: keep focus on the link and announce the new page. 
  // Primer's approach was chosen.)
  const handlePageLinkClick = () => {
    didUserChangePage.current = true;
  };

  // useCallback keeps the same function between renders until pageNumber changes.
  // Without it, a new function is created on every render, so the effect below
  // would see a "different" fetchProducts each time and re-run unnecessarily.
  const fetchProducts = useCallback(async (signal: AbortSignal) => {
    const skip = (pageNumber - 1) * PRODUCTS_PER_PAGE;
    try {
      const res = await fetch(
        `https://dummyjson.com/products??sortBy=title&order=desc&limit=${PRODUCTS_PER_PAGE}&skip=${skip}&select=title,thumbnail`,
        { signal }
      );
      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();

      if (data && data.products) {
        setProducts(data.products);
        setTotal(data.total);
        setError(null);
      }
      else {
        setError('The product data could not be read.');
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError('Could not load products. Please try again.');
      console.log(e);
    }
  }, [pageNumber]);

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const pages = getPageWindow(pageNumber, totalPages);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    // cleanup. 
    return () => controller.abort();
  }, [fetchProducts]);


  // GOV.UK recommends the page number in the title so people know they have moved
  // to a different page. Only set once results exist.
  useEffect(() => {
    if (totalPages > 0) {
      document.title = `Page ${pageNumber} of ${totalPages} – DummyJSON Products`;
    }
  }, [pageNumber, totalPages]);

  // State changes, then React updates the DOM, focus has to wait for render to finish.
  useEffect(() => {
    // skip on first load because it didn't come from the user triggering it
    if (!didUserChangePage.current) return;
    didUserChangePage.current = false;
    // focus on the new content
    listRef.current?.focus({ preventScroll: true });
    // make sure heading is visible also.
    window.scrollTo({ behavior: "smooth", top: 0 });
  }, [products]);

  return (
    <>
      <h1 id="products-heading">Products {totalPages > 0 && `Page ${pageNumber} of ${totalPages}`}</h1>
      <section aria-labelledby="products-heading">
        {error && <p className="error" role="alert">{error}</p>}
        <ol className="product-grid" role="list" ref={listRef} tabIndex={-1} aria-labelledby="products-heading">
          {products.map((product) => (
            <li key={product.id}>
              <a className="product-card" href={`/products/${product.id}`}>
                  {/* decorative */}
                  <img src={product.thumbnail} alt="" />
                  <span className="product-title">{product.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>
      <section>
        {totalPages > 1 && (
          <nav aria-labelledby="pagination-label">
            <span id="pagination-label" hidden>Product Pages</span>
            <span id="prefix" hidden>Page</span>
            <ol role="list">
              {/* 
                Announced "Previous Page" / "Next Page" (GOV.UK, eBay).
                The name starts with the visible text (GitHub Primer). 
                rel="prev"/"next" as on GOV.UK. 
                Hidden on the first/last page (GOV.UK). 
              */}
              {pageNumber > 1 && (
                <li>
                  <Link id="link-previous"
                    to={`?page=${pageNumber - 1}`}
                    rel="prev"
                    aria-labelledby="link-previous prefix"
                    onClick={handlePageLinkClick}
                  >
                    Previous
                  </Link>
                </li>
              )}
              {/* 
                Name = hidden "Page" + the link's own text, e.g. "Page 3" (GOV.UK, GitHub Primer).
                aria-current marks the current page (GOV.UK, GitHub Primer). 
              */}
              {pages.map((page) => (
                <li key={page}>
                  <Link
                    id={`link-${page}`}
                    to={`?page=${page}`}
                    aria-labelledby={`prefix link-${page}`}
                    aria-current={page === pageNumber ? 'page' : undefined}
                    onClick={handlePageLinkClick}
                  >
                    {page}
                  </Link>
                </li>
              ))}
              {pageNumber < totalPages && (
                <li>
                  <Link id="link-next"
                    rel="next"
                    aria-labelledby="link-next prefix"
                    to={`?page=${pageNumber + 1}`}
                    onClick={handlePageLinkClick}
                  >
                    Next
                  </Link>
                </li>
              )}
            </ol>
          </nav>
        )}
      </section>
    </>
  )
}

export default App;
