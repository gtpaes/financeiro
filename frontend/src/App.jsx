import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* rota inicial */}
        <Route path="/" element={<Login />} />

        {/* login explícito (opcional mas recomendado) */}
        <Route path="/login" element={<Login />} />

        {/* registro */}
        <Route path="/register" element={<Register />} />

        {/* dashboard protegida */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* fallback (qualquer rota errada) */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;