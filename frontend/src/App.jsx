import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import axiosInstance from "./lib/axios";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  console.log("🔍 [DEBUG] Current VITE_API_URL:", import.meta.env.VITE_API_URL); // Verify env var

  // Sync user to MongoDB on login
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      axiosInstance
        .post("/users/sync")
        .then(() => console.log("✅ User synced to MongoDB"))
        .catch((error) => console.error("❌ Error syncing user:", error));
    }
  }, [isSignedIn, isLoaded]);

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
