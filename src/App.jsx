import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { RootLayout } from './layouts/RootLayout'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Transactions } from './pages/Transactions'
import { Budgets } from './pages/Budgets'
import { Profile } from './pages/Profile'

// PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
  if (!user) return <Navigate to="/login" />
  return children
}

// AuthRoute wrapper (redirects to dashboard if already logged in)
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
  if (user) return <Navigate to="/" />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } />

          <Route path="/register" element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          } />

          <Route element={
            <PrivateRoute>
              <RootLayout />
            </PrivateRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-transaction" element={<Transactions />} />
            <Route path="/set-budget" element={<Budgets />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
