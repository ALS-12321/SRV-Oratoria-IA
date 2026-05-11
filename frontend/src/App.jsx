import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import ModoSeleccion from './pages/ModoSeleccion'
import Practica from './pages/Practica'
import Historial from './pages/Historial'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/modos" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/modos" element={<PrivateRoute><ModoSeleccion /></PrivateRoute>} />
          <Route path="/practica" element={<PrivateRoute><Practica /></PrivateRoute>} />
          <Route path="/historial" element={<PrivateRoute><Historial /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
