import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ProgressProvider } from './context/ProgressContext';
import { AppShell } from './layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Trilha } from './pages/Trilha/Trilha';
import { Vocab } from './pages/Vocab';
import { Cenarios } from './pages/Cenarios/Cenarios';
import { Conjugador } from './pages/Conjugador';
import { Progresso } from './pages/Progresso';
import { Config } from './pages/Config';

export default function App() {
  return (
    <LanguageProvider>
      <ProgressProvider>
        <HashRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trilha" element={<Trilha />} />
              <Route path="/vocab" element={<Vocab />} />
              <Route path="/cenarios" element={<Cenarios />} />
              <Route path="/conjugador" element={<Conjugador />} />
              <Route path="/progresso" element={<Progresso />} />
              <Route path="/config" element={<Config />} />
            </Routes>
          </AppShell>
        </HashRouter>
      </ProgressProvider>
    </LanguageProvider>
  );
}
