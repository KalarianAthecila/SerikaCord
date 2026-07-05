"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { docNav } from "@/lib/constants/docs-nav";
import { Search, Menu, X, ChevronRight, ExternalLink } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSlug = useMemo(() => {
    const parts = pathname?.replace("/developers/docs/", "").split("/") || [];
    return parts.join("/");
  }, [pathname]);

  const filteredNav = useMemo(() => {
    if (!search.trim()) return docNav;
    const q = search.toLowerCase();
    return docNav
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [search]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 size-12 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-lg"
      >
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-72 border-r border-white/[0.06] bg-[#0d0d0d] flex flex-col shrink-0 overflow-y-auto",
          "fixed md:static inset-y-0 left-0 z-40 transition-transform md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Search */}
        <div className="p-4 border-b border-white/[0.06] sticky top-0 bg-[#0d0d0d] z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search docs..."
              className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#8B5CF6]/50"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          {filteredNav.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-xs font-bold text-[#666] uppercase tracking-wide px-3 mb-2">
                {section.title}
              </h3>
              {section.items.map((item) => {
                const href = `/developers/docs/${item.slug}`;
                const active = currentSlug === item.slug;
                return (
                  <Link
                    key={item.slug}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors mb-0.5",
                      active
                        ? "bg-[#8B5CF6]/15 text-[#a78bfa] font-medium"
                        : "text-[#999] hover:text-white hover:bg-white/5"
                    )}
                  >
                    <ChevronRight
                      className={cn("size-3 shrink-0", active ? "text-[#8B5CF6]" : "text-[#333]")}
                    />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto text-[10px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <Link
            href="/developers/applications"
            className="text-xs text-[#666] hover:text-white transition-colors flex items-center gap-1"
          >
            <ExternalLink className="size-3" /> Go to Applications
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">{children}</div>
      </div>
    </div>
  );
}
