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
import TermsAgreement from './pages/TermsAgreement';
import PublicRoutes from './routes/PublicRoutes';
import AuthRoutes from './routes/AuthRoutes';
import UserRoutes from './routes/UserRoutes';
import { AuthProvider } from './context/AuthContext';
import { BrewProvider } from './context/BrewContext';
import { SettingsProvider } from './context/SettingsContext';

const App: React.FC = () => {
  return (
    <AuthProvider> {/* 一つだけ定義しないと認証状態がバラバラになる */}
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">
            <Routes>
              {/* 公開ルート */}
              <Route element={<PublicRoutes />}>
                <Route path="/" element={<Home />} />
              </Route>

              {/* Googleログインが必要なルート */}
              <Route element={
                <AuthRoutes />
              }>
                <Route path="/signup" element={<TermsAgreement />} />
              </Route>

              {/* 利用登録が必要なルート */}
              <Route element={
                <BrewProvider>
                  <SettingsProvider>
                    <UserRoutes />
                  </SettingsProvider>
                </BrewProvider>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
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
    </AuthProvider>
  );
};

export default App;
