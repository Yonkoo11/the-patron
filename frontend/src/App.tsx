import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import GrantsPage from "./pages/GrantsPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg text-text-primary">
        <Header />
        <main className="mx-auto max-w-[1200px] px-6 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/grants" element={<GrantsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
