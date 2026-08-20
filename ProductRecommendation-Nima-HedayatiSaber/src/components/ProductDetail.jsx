function ProductDetail({ product, related, onSelect, onAddToCart, onClose }) {
  if (!product) return null;

  return (
    <div className="space-y-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Selected Product</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100"
        >
          Close
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <img
          src={product.image}
          alt={product.title}
          className="mx-auto h-40 object-contain"
        />
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-violet-700">
            {product.category}
          </p>
          <h3 className="mb-2 font-bold text-gray-900">{product.title}</h3>
          <p className="mb-3 text-sm text-gray-600">{product.description}</p>
          <p className="mb-3 text-xl font-bold text-blue-600">${product.price}</p>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-gray-800">
          Related Products (same category)
        </h3>
        {related.length === 0 ? (
          <p className="text-sm text-gray-500">No related products found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="rounded-lg border border-gray-200 bg-white p-2 text-left hover:border-violet-400"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="mb-2 h-20 w-full object-contain"
                />
                <p className="line-clamp-2 text-xs font-semibold text-gray-800">
                  {item.title}
                </p>
                <p className="text-sm font-bold text-blue-600">${item.price}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
