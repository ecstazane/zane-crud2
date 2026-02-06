import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import DynamicTable from './pages/DynamicTable';
import DynamicForm from './pages/DynamicForm';
import AuditLogViewer from './pages/AuditLogViewer';
import ArchiveView from './pages/ArchiveView';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
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

  useEffect(() => {
    axios.get('http://localhost:5001/api/config/models')
      .then(res => setModels(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-white border-r border-neutral-200 flex flex-col transition-all duration-200`}>
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
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
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
