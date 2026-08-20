function ProductCard({ product, onSelect, onAddToCart }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="flex flex-1 flex-col text-left"
      >
        <div className="flex h-44 items-center justify-center bg-gray-50 p-4">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <span className="w-fit rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-violet-700">
            {product.category}
          </span>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">
            {product.title}
          </h3>
          <p className="mt-auto text-lg font-bold text-blue-600">
            ${product.price}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onAddToCart(product)}
        className="m-3 mt-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
