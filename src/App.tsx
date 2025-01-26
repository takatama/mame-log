import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import BrewForm from './pages/BrewForm';
import BrewList from './pages/BrewList';
import BrewDetails from './pages/BrewDetails';
import Settings from './pages/Settings';
import BeanForm from './pages/BeanForm';
import BeanList from './pages/BeanList';
import BeanDetails from './pages/BeanDetails';
import BeanCapture from './pages/BeanCapture';
import PublicRoutes from './routes/PublicRoutes';
import UserRoutes from './routes/UserRoutes';
import { CoffeeProvider } from './context/CoffeeContext';
import { SettingsProvider } from './context/SettingsContext';
import { SessionProvider } from '@hono/auth-js/react';

const App: React.FC = () => {
  return (
    <SessionProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">
            <Routes>
              {/* 公開ルート */}
              <Route element={<PublicRoutes />}>
                <Route path="/" element={<Home />} />
              </Route>

              {/* 利用登録が必要なルート */}
              <Route element={
                <CoffeeProvider>
                  <SettingsProvider>
                    <UserRoutes />
                  </SettingsProvider>
                </CoffeeProvider>
              }>
                <Route path="/dashboard" element={<BeanList />} />
                <Route path="/beans" element={<BeanList />} />
                <Route path="/beans/new" element={<BeanForm />} />
                <Route path="/beans/new/capture" element={<BeanCapture />} />
                <Route path="/beans/:beanId" element={<BeanDetails />} />
                <Route path="/beans/:beanId/capture" element={<BeanCapture />} />
                <Route path="/beans/:beanId/edit" element={<BeanForm />} />
                <Route path="/beans/:beanId/brews/new" element={<BrewForm />} />
                <Route path="/brews" element={<BrewList />} />
                <Route path="/brews/new" element={<BrewForm />} />
                <Route path="/brews/:brewId" element={<BrewDetails />} />
                <Route path="/brews/:brewId/edit" element={<BrewForm />} />
                <Route path="/brews/:baseBrewId/brews/new" element={<BrewForm />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </main>
          <footer className="bg-gray-800 text-white text-center p-4">
            <p>
              &copy; 2025 <a target="_blank" href="https://x.com/takatama_jp">@takatama_jp</a>. All rights reserved.
            </p>
          </footer>
        </div>
      </Router>
    </SessionProvider>
  );
};

export default App;
