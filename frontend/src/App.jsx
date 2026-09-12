import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Home from "./pages/Home";
import Pets from "./pages/Pets";
import PetDetail from "./pages/PetDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import { lazy, Suspense } from "react";

const Profile = lazy(() => import("./pages/Profile"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Shelters = lazy(() => import("./pages/Shelters"));
const ShelterDetail = lazy(() => import("./pages/ShelterDetail"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Consultations = lazy(() => import("./pages/Consultations"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontSize: "3rem",
      }}
    >
      <span>🐾</span>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Públicas */}
            <Route index element={<Home />} />
            <Route path="pets" element={<Pets />} />
            <Route path="pets/:id" element={<PetDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="shelters"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Shelters />
                </Suspense>
              }
            />
            <Route
              path="shelters/:id"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ShelterDetail />
                </Suspense>
              }
            />
            <Route
              path="how-it-works"
              element={
                <Suspense fallback={<PageLoader />}>
                  <HowItWorks />
                </Suspense>
              }
            />
            <Route
              path="marketplace"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Marketplace />
                </Suspense>
              }
            />
            <Route
              path="user/:id"
              element={
                <Suspense fallback={<PageLoader />}>
                  <UserProfile />
                </Suspense>
              }
            />
            <Route
              path="consultations"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Consultations />
                </Suspense>
              }
            />

            {/* Protegidas */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Profile />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="my-applications"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <MyApplications />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="favorites"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Favorites />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requiredRole="shelter">
                  <Suspense fallback={<PageLoader />}>
                    <Dashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
