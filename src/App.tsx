import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BrewForm from './pages/BrewForm';
import BrewList from './pages/BrewList';
import BrewDetails from './pages/BrewDetails';
import Settings from './pages/Settings';
import BeanForm from './pages/BeanForm';
import BeanList from './pages/BeanList';
import BeanDetails from './pages/BeanDetails';
import { BrewProvider } from './context/BrewContext';
import BeanCapture from './pages/BeanCapture';
import { SettingsProvider } from './context/SettingsContext';
import TermsAgreement from './pages/TermsAgreement';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<TermsAgreement />} />
            <Route
              path="/dashboard"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <Dashboard />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/beans"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BeanList />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/beans/new"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BeanForm />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/beans/new/capture"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BeanCapture />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/beans/:beanId"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BeanDetails />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/beans/:beanId/capture"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BeanCapture />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/beans/:beanId/edit"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BeanForm />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/beans/:beanId/brews/new"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BrewForm />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/brews"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BrewList />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/brews/new"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BrewForm />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/brews/:brewId"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BrewDetails />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/brews/:brewId/edit"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BrewForm />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/brews/:baseBrewId/brews/new"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <BrewForm />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthProvider>
                  <BrewProvider>
                    <SettingsProvider>
                      <Settings />
                    </SettingsProvider>
                  </BrewProvider>
                </AuthProvider>
              }
            />
          </Routes>
        </main>
        {/* フッター */}
        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; 2025 <a target="_blank" href="https://x.com/takatama_jp">@takatama_jp</a>. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
