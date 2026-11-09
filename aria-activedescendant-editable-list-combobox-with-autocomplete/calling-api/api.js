'use strict';

const API_URL = "https://dummyjson.com/products";
// "default" search is to return everything, otherwise
// pass query to /search endpoint.
async function fetchSuggestions(query, signal) {
    const url = new URL(query ? `${API_URL}/search` : API_URL);

    if (query) {
        url.searchParams.set("q", query);
    }

    url.searchParams.set("select", "id,title");
    url.searchParams.set("sortBy", "title");
    url.searchParams.set("order", "asc");
    url.searchParams.set("limit", "0");     // default limit is 30 per their docs.

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    let products = data.products;

    if (query) {
        products = products.filter((product) => product.title.toLowerCase().startsWith(query));
    }

    return products.map((product) => ({
        id: product.id,
        label: product.title,
        value: product.title
    }));
}