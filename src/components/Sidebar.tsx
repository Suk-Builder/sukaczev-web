import { Link, useLocation } from "react-router-dom";
import { Home, Flame, Tv, Music, Gamepad2, BookOpen, Coffee, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "首页" },
  { to: "/hot", icon: Flame, label: "热门" },
  { to: "/category/animation", icon: Tv, label: "动画" },
  { to: "/category/music", icon: Music, label: "音乐" },
  { to: "/category/game", icon: Gamepad2, label: "游戏" },
  { to: "/category/knowledge", icon: BookOpen, label: "知识" },
  { to: "/category/life", icon: Coffee, label: "生活" },
  { to: "/category/tech", icon: Cpu, label: "科技" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-56 bg-[#0a0a0f] border-r border-[#1a1a1e] overflow-y-auto z-40">
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-[#CD5700]/10 text-[#CD5700] font-medium"
                  : "text-[#8a8680] hover:text-[#e8e6e3] hover:bg-[#121214]"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-[#CD5700]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-2 h-px bg-[#1a1a1e]" />

      {/* Footer */}
      <div className="px-4 py-3 text-xs text-[#5a5a5e]">
        <p>裂缝·递砖·建造者</p>
        <p className="mt-1">BDI 150+ | Sukačev</p>
      </div>
    </aside>
  );
}
