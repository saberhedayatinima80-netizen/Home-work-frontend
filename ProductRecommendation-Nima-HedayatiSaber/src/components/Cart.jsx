function Cart({ cart, onRemove, onClear }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Cart ({cart.reduce((n, i) => n + i.qty, 0)})
        </h2>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-red-500 hover:text-red-600"
          >
            Clear
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="text-sm text-gray-500">Cart is empty.</p>
      ) : (
        <ul className="space-y-2">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">
                  ${item.price} × {item.qty}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 border-t border-gray-200 pt-3 text-right text-base font-bold text-gray-900">
        Total: ${total.toFixed(2)}
      </p>
    </div>
  );
}

export default Cart;
