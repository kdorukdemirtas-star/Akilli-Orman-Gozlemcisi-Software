import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/react";
import { Home } from "./Home.jsx";
import { Device } from "./Device.jsx";
import { Shell } from "./SiteNav.jsx";
import { RequireAuth } from "./RequireAuth.jsx";
import "./site.css";

const Dashboard = lazy(() => import("./Dashboard.jsx"));
const Sistem = lazy(() => import("./Sistem.jsx"));
const Karisim = lazy(() => import("./Karisim.jsx"));
const Analizler = lazy(() => import("./Analizler.jsx"));
const Eklentiler = lazy(() => import("./Eklentiler.jsx"));
const Asistan = lazy(() => import("./Asistan.jsx"));
const Makine = lazy(() => import("./Makine.jsx"));
const Pair = lazy(() => import("./Pair.jsx"));
const Gizlilik = lazy(() => import("./Gizlilik.jsx"));
const Cerezler = lazy(() => import("./Cerezler.jsx"));
const Destek = lazy(() => import("./Destek.jsx"));

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

function CihazGate() {
  return (
    <RequireAuth
      product="software"
      title="Cihaz"
      lead="Kutu ve cihaz sayfası hesaba bağlıdır. Giriş yapmadan cihaz ekranı açılmaz."
    >
      <Device product="software" />
    </RequireAuth>
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
          <RequireAuth
            product="software"
            title="Pano"
            lead="Pano hesaba bağlıdır. Giriş yapmadan istasyon ekranı açılmaz."
          >
            <Suspense fallback={<BoardFallback product="software" />}>
              <Dashboard />
            </Suspense>
          </RequireAuth>
        }
      />
      <Route
        path="/eklentiler"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Eklentiler product="software" />
          </Suspense>
        }
      />
      <Route
        path="/asistan"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <RequireAuth
              product="software"
              title="Asistan"
              lead="Sohbetler hesaba yazılır. Başka hesabın sohbeti bu tarayıcıda görünmez."
            >
              <Asistan product="software" />
            </RequireAuth>
          </Suspense>
        }
      />
      <Route
        path="/makine"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Makine product="software" />
          </Suspense>
        }
      />
      <Route
        path="/pair"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Pair product="software" />
          </Suspense>
        }
      />
      <Route
        path="/gizlilik"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Gizlilik />
          </Suspense>
        }
      />
      <Route
        path="/cerezler"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Cerezler />
          </Suspense>
        }
      />
      <Route
        path="/destek"
        element={
          <Suspense fallback={<PageFallback product="software" />}>
            <Destek />
          </Suspense>
        }
      />
      <Route path="/cihaz" element={<CihazGate />} />
      <Route path="/cihaz/:kind" element={<CihazGate />} />
      <Route path="/yerel/ios" element={<Navigate to="/cihaz/ios" replace />} />
      <Route path="/yerel/android" element={<Navigate to="/cihaz/android" replace />} />
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
