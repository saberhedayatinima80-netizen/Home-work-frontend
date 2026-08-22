import { Fragment, useState } from "react";

function ProductCard({ name, price, description }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p className="price">{price} $</p>
      <p>{description}</p>
    </div>
  );
}

function InputLogger() {
  const [text, setText] = useState("");

  function handleClick() {
    console.log(text);
  }

  return (
    <div className="section">
      <input
        type="text"
        placeholder="Type something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="button" onClick={handleClick}>
        Show in Console
      </button>
    </div>
  );
}

function UserList({ users }) {
  return (
    <Fragment>
      {users.map((user, index) => (
        <Fragment key={index}>
          <p>
            {user.name} - {user.age} years - {user.city}
          </p>
        </Fragment>
      ))}
    </Fragment>
  );
}

function App() {
  const products = [
    {
      name: "Laptop",
      price: 1200,
      description: "A fast laptop for coding and work.",
    },
    {
      name: "Headphones",
      price: 80,
      description: "Wireless headphones with good battery.",
    },
    {
      name: "Keyboard",
      price: 45,
      description: "Mechanical keyboard for daily use.",
    },
  ];

  const users = [
    { name: "Ali", age: 22, city: "Tehran" },
    { name: "Sara", age: 25, city: "Isfahan" },
    { name: "Reza", age: 30, city: "Shiraz" },
  ];

  return (
    <div className="app">
      <h1>React Basics - Nima HedayatiSaber</h1>

      <h2>1. Product List (props)</h2>
      <div className="list">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            name={product.name}
            price={product.price}
            description={product.description}
          />
        ))}
      </div>

      <h2>2. Input + Button (console.log)</h2>
      <InputLogger />

      <h2>3. User List (props + Fragment)</h2>
      <UserList users={users} />
    </div>
  );
}

export default App;
