import { Route, Routes } from 'react-router-dom';
import { ConfigProvider } from './contexts/ConfigContext.jsx';
import { PlannerProvider } from './contexts/PlannerContext.jsx';
import { ScanProvider } from './contexts/ScanContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { TryOnProvider } from './contexts/TryOnContext.jsx';
import { Layout } from './components/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { Looks } from './pages/Looks.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { Planner } from './pages/Planner.jsx';
import { Report } from './pages/Report.jsx';
import { TryOn } from './pages/TryOn.jsx';

export default function App() {
  return (
    <ConfigProvider>
      <ToastProvider>
        <PlannerProvider>
          <ScanProvider>
            <TryOnProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="report" element={<Report />} />
                  <Route path="looks" element={<Looks />} />
                  <Route path="try-on" element={<TryOn />} />
                  <Route path="planner" element={<Planner />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </TryOnProvider>
          </ScanProvider>
        </PlannerProvider>
      </ToastProvider>
    </ConfigProvider>
  );
}
