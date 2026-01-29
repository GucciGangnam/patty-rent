import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SearchProvider } from './contexts/SearchContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Organisation from './pages/Organisation'
import Assets from './pages/Assets'
import JoinInvite from './pages/JoinInvite'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/join/:inviteCode" element={<JoinInvite />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/organisation" element={<Organisation />} />
            <Route path="/assets" element={<Assets />} />
          </Route>
        </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
