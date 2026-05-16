import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import VideoPage from "@/pages/VideoPage";
import CategoryPage from "@/pages/CategoryPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hot" element={<HomePage sort="hot" subtitle="热门视频 — 最受欢迎的建造者作品" />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
      </Route>
    </Routes>
  );
}
