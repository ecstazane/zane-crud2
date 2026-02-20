import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import DynamicTable from './pages/DynamicTable';
import DynamicForm from './pages/DynamicForm';
import AuditLogViewer from './pages/AuditLogViewer';
import ArchiveView from './pages/ArchiveView';

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-colors
        ${isActive
          ? 'bg-neutral-900 text-white'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
    >
      {children}
    </Link>
  );
};

function AppContent() {
  const [models, setModels] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    axios.get('http://localhost:5001/api/config/models')
      .then(res => setModels(res.data))
      .catch(err => console.error(err));
  }, []);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-neutral-200 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-semibold text-neutral-900 text-lg">task2</h1>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 backdrop-enter" onClick={closeMobileMenu}>
          <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col sidebar-enter"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200">
              <h1 className="font-semibold text-neutral-900 text-lg">task2</h1>
              <button
                onClick={closeMobileMenu}
                className="p-2 -mr-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav
              className="flex-1 overflow-y-auto p-3 space-y-1"
              onClick={(e) => {
                // Close sidebar when any link is clicked (event delegation)
                if (e.target.closest('a')) closeMobileMenu();
              }}
            >
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-2 px-4">Models</p>
              {Object.keys(models).map(modelName => (
                <NavLink key={modelName} to={`/${modelName}`} onClick={closeMobileMenu}>
                  {modelName}
                </NavLink>
              ))}

              <div className="border-t border-neutral-100 my-3 pt-3">
                <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-2 px-4">System</p>
                <NavLink to="/archive" onClick={closeMobileMenu}>Archive</NavLink>
                <NavLink to="/audit-logs" onClick={closeMobileMenu}>Audit Logs</NavLink>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${sidebarOpen ? 'w-56' : 'w-16'} bg-white border-r border-neutral-200 flex-col transition-all duration-200`}>
        <div className="h-14 flex items-center justify-center border-b border-neutral-200">
          <h1 className={`font-semibold text-neutral-900 ${sidebarOpen ? 'text-lg' : 'text-sm'}`}>
            {sidebarOpen ? 'task2' : 'T2'}
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className={`text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-2 ${sidebarOpen ? 'px-4' : 'text-center'}`}>
            {sidebarOpen ? 'Models' : '—'}
          </p>
          {Object.keys(models).map(modelName => (
            <NavLink key={modelName} to={`/${modelName}`}>
              {sidebarOpen ? modelName : modelName.charAt(0)}
            </NavLink>
          ))}

          <div className="border-t border-neutral-100 my-3 pt-3">
            <p className={`text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-2 ${sidebarOpen ? 'px-4' : 'text-center'}`}>
              {sidebarOpen ? 'System' : '—'}
            </p>
            <NavLink to="/archive">
              {sidebarOpen ? 'Archive' : 'A'}
            </NavLink>
            <NavLink to="/audit-logs">
              {sidebarOpen ? 'Audit Logs' : 'L'}
            </NavLink>
          </div>
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-12 border-t border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors text-sm"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto fade-in">
          <Routes>
            <Route path="/audit-logs" element={<AuditLogViewer />} />
            <Route path="/archive" element={<ArchiveView models={models} />} />
            <Route path="/:model" element={<DynamicTable models={models} />} />
            <Route path="/:model/add" element={<DynamicForm models={models} />} />
            <Route path="/:model/edit/:id" element={<DynamicForm models={models} />} />
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Welcome to task2</h2>
                <p className="text-neutral-500">Select a model from the sidebar to get started.</p>
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
