"use client";

import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";

const exampleTimestamp = Math.floor(Date.now() / 1000) + 3600;

const markdownExamples: { syntax: string; content: string }[] = [
  { syntax: "**bold**", content: "**bold**" },
  { syntax: "*italic*", content: "*italic*" },
  { syntax: "__underline__", content: "__underline__" },
  { syntax: "~~strikethrough~~", content: "~~strikethrough~~" },
  { syntax: "`inline code`", content: "`inline code`" },
  { syntax: "> quote", content: "> This is a quote" },
  { syntax: ">>> quote block", content: ">>> This is a\nmulti-line quote" },
  { syntax: "||spoiler||", content: "||spoiler||" },
  { syntax: "-# small text", content: "-# small text" },
];

const timestampFormats: { format: string; syntax: string }[] = [
  { format: "t", syntax: `<t:${exampleTimestamp}:t>` },
  { format: "T", syntax: `<t:${exampleTimestamp}:T>` },
  { format: "d", syntax: `<t:${exampleTimestamp}:d>` },
  { format: "D", syntax: `<t:${exampleTimestamp}:D>` },
  { format: "f", syntax: `<t:${exampleTimestamp}:f>` },
  { format: "F", syntax: `<t:${exampleTimestamp}:F>` },
  { format: "R", syntax: `<t:${exampleTimestamp}:R>` },
  { format: "C", syntax: `<t:${exampleTimestamp}:C>` },
];

export function MarkdownLivePreview() {
  return (
    <div className="my-4 rounded-xl border border-white/[0.08] overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-white/[0.03] border-b border-white/[0.08]">
            <th className="text-left px-4 py-2.5 font-semibold text-[#dbdee1]">Syntax</th>
            <th className="text-left px-4 py-2.5 font-semibold text-[#dbdee1]">Live Preview</th>
          </tr>
        </thead>
        <tbody>
          {markdownExamples.map((ex) => (
            <tr key={ex.syntax} className="border-b border-white/[0.04]">
              <td className="px-4 py-2.5 font-mono text-[#a78bfa] text-[12px] whitespace-nowrap">{ex.syntax}</td>
              <td className="px-4 py-2.5 text-[#dbdee1]">
                <MarkdownRenderer content={ex.content} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TimestampLivePreview() {
  return (
    <div className="my-4 rounded-xl border border-white/[0.08] overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-white/[0.03] border-b border-white/[0.08]">
            <th className="text-left px-4 py-2.5 font-semibold text-[#dbdee1]">Format</th>
            <th className="text-left px-4 py-2.5 font-semibold text-[#dbdee1]">Syntax</th>
            <th className="text-left px-4 py-2.5 font-semibold text-[#dbdee1]">Live Preview</th>
          </tr>
        </thead>
        <tbody>
          {timestampFormats.map((ex) => (
            <tr key={ex.format} className="border-b border-white/[0.04]">
              <td className="px-4 py-2.5 font-mono text-[#a78bfa] text-[12px]">{ex.format}</td>
              <td className="px-4 py-2.5 font-mono text-[#888888] text-[11px] whitespace-nowrap">{ex.syntax}</td>
              <td className="px-4 py-2.5 text-[#dbdee1]">
                <MarkdownRenderer content={ex.syntax} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
