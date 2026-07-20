import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <h1>Budget Tracker</h1>
          <nav className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Transactions
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Categories
            </NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
