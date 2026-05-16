import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#CD5700]/20">
      <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#CD5700]">Suka</span>
            <span className="text-[#e8e6e3]">čev</span>
          </span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索裂缝中的建造..."
              className="w-full h-9 pl-10 pr-4 bg-[#121214] border border-[#2a2a2e] rounded-lg text-sm text-[#e8e6e3] placeholder:text-[#5a5a5e] focus:outline-none focus:border-[#CD5700]/50 focus:ring-1 focus:ring-[#CD5700]/20 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a5e]" />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-[#8a8680] hover:text-[#CD5700] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link
            to="/upload"
            className="hidden sm:flex items-center gap-1.5 h-8 px-4 bg-[#CD5700] hover:bg-[#b84d00] text-white text-sm font-medium rounded transition-colors"
          >
            <Upload className="w-4 h-4" />
            投稿
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 h-8 px-4 border border-[#2a2a2e] hover:border-[#CD5700]/50 text-[#e8e6e3] text-sm rounded transition-colors"
          >
            <User className="w-4 h-4" />
            登录
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-[#8a8680] hover:text-[#CD5700] transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-[#1a1a1e]">
          <form onSubmit={handleSearch} className="mt-2">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索..."
                autoFocus
                className="w-full h-10 pl-10 pr-4 bg-[#121214] border border-[#2a2a2e] rounded-lg text-sm text-[#e8e6e3] placeholder:text-[#5a5a5e] focus:outline-none focus:border-[#CD5700]/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a5e]" />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
