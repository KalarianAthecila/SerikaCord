"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPrevNext } from "@/lib/constants/docs-nav";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DocPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const slug = pathname?.replace("/developers/docs/", "") || "";
  const { prev, next } = getPrevNext(slug);

  return (
    <article>
      <header className="mb-8 pb-6 border-b border-white/[0.06]">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {description && <p className="text-[#888] text-base">{description}</p>}
      </header>
      <div className="text-[#ccc] text-sm leading-relaxed space-y-4 doc-content">
        {children}
      </div>

      {/* Prev/Next Nav */}
      <div className="mt-12 pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
        {prev ? (
          <Link
            href={`/developers/docs/${prev.slug}`}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors group"
          >
            <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <div>
              <p className="text-xs text-[#555]">Previous</p>
              <p className="font-medium">{prev.label}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/developers/docs/${next.slug}`}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors group text-right"
          >
            <div>
              <p className="text-xs text-[#555]">Next</p>
              <p className="font-medium">{next.label}</p>
            </div>
            <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}

export function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  return (
    <pre className="bg-[#0d0d0d] border border-white/[0.08] rounded-lg p-4 overflow-x-auto my-4">
      <code className={`language-${lang} text-xs font-mono text-[#ccc]`}>{children}</code>
    </pre>
  );
}

export function Endpoint({
  method,
  path,
  children,
}: {
  method: string;
  path: string;
  children: React.ReactNode;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-green-500/15 text-green-400",
    POST: "bg-blue-500/15 text-blue-400",
    PUT: "bg-yellow-500/15 text-yellow-400",
    PATCH: "bg-orange-500/15 text-orange-400",
    DELETE: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="my-4 rounded-lg border border-white/[0.08] overflow-hidden">
      <div className="flex items-center gap-3 bg-[#1a1a1a] px-4 py-2.5 border-b border-white/[0.06]">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${methodColors[method] || "bg-white/10 text-white"}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-[#ccc]">{path}</code>
      </div>
      <div className="p-4 text-xs text-[#aaa]">{children}</div>
    </div>
  );
}

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-[#5865F2]/30 bg-[#5865F2]/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    danger: "border-red-500/30 bg-red-500/5",
  };
  const titleColors = {
    info: "text-[#5865F2]",
    warning: "text-yellow-400",
    danger: "text-red-400",
  };

  return (
    <div className={`rounded-lg border p-4 my-4 ${styles[type]}`}>
      {title && <p className={`text-sm font-semibold mb-1 ${titleColors[type]}`}>{title}</p>}
      <div className="text-xs text-[#aaa]">{children}</div>
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/[0.08]">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 font-semibold text-[#888]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.04]">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-[#ccc]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-xl font-bold text-white mt-8 mb-3 scroll-mt-20">
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3 id={id} className="text-base font-semibold text-white mt-6 mb-2 scroll-mt-20">
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#ccc] leading-relaxed my-3">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="text-sm text-[#ccc] list-disc list-inside space-y-1 my-3">{children}</ul>;
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="bg-[#1a1a1a] border border-white/[0.06] rounded px-1.5 py-0.5 text-xs font-mono text-[#a78bfa]">{children}</code>;
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="text-white font-semibold">{children}</strong>;
}

export function Link2({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[#8B5CF6] hover:underline">
      {children}
    </Link>
  );
}
