import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Home } from "./Home.jsx";
import { Device } from "./Device.jsx";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

const Dashboard = lazy(() => import("./Dashboard.jsx"));
const Sistem = lazy(() => import("./Sistem.jsx"));
const Karisim = lazy(() => import("./Karisim.jsx"));
const Analizler = lazy(() => import("./Analizler.jsx"));

function BoardFallback({ product }) {
  return (
    <Shell product={product} footer={false}>
      <p className="boot" role="status">Pano açılıyor.</p>
    </Shell>
  );
}

function PageFallback({ product }) {
  return (
    <Shell product={product} footer={false}>
      <p className="boot" role="status">Sayfa açılıyor.</p>
    </Shell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home product="software" />} />
      <Route path="/kutu" element={<Navigate to="/" replace />} />
      <Route path="/moduller" element={<Home product="software" />} />
      <Route
        path="/sistem"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Sistem product="software" />
          </Suspense>
        }
      />
      <Route
        path="/karisim"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Karisim product="software" />
          </Suspense>
        }
      />
      <Route
        path="/analizler"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Analizler product="software" />
          </Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<BoardFallback product="software" />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route path="/pair" element={<Navigate to="/dashboard" replace />} />
      <Route path="/cihaz" element={<Device product="software" />} />
      <Route path="/cihaz/:kind" element={<Device product="software" />} />
      <Route path="/yerel/ios" element={<Navigate to="/cihaz/ios" replace />} />
      <Route path="/yerel/android" element={<Navigate to="/cihaz/android" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
