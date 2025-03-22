import { Routes, Route } from "react-router-dom";
import ShoppingCart from "./pages/ShoppingCart";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<ShoppingCart />} />
      </Routes>
    </>
  )
}

export default App
