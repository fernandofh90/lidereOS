import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider } from './context';
import { Home, Team, Tasks, NewMeeting, Feedback, Orientation, Login } from './pages';
import { LayoutDashboard, Users, CheckSquare, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (o: boolean) => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link 
      to={to} 
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(to) ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileOpen(false)} />}
      
      {/* Sidebar Content */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xl font-bold text-slate-900 tracking-tight">Lidere.OS</span>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-500"><X /></button>
        </div>
        
        <nav className="p-4 space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="Home" />
          <NavItem to="/team" icon={Users} label="Meu Time" />
          <NavItem to="/tasks" icon={CheckSquare} label="Responsabilidades" />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
           <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-600 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
           </Link>
        </div>
      </aside>
    </>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === '/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <span className="font-bold text-slate-900">Lidere.OS</span>
        <button onClick={() => setMobileOpen(true)} className="text-slate-600"><Menu /></button>
      </div>

      <main className="md:pl-64 p-4 md:p-8 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<Team />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/meeting/new" element={<NewMeeting />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/orientation" element={<Orientation />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}