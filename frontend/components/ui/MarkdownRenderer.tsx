"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Terminal } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  const isInline = !match && !codeString.includes("\n");

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-[11px] rounded-sm select-all"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="relative my-3 rounded-none border border-zinc-800/90 bg-zinc-950 overflow-hidden group">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800/80 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Terminal className="h-3 w-3 text-emerald-400" />
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] hover:text-white text-zinc-400 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 transition-colors rounded-none cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-2.5 w-2.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="h-2.5 w-2.5" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-zinc-200 scrollbar-thin">
        <pre className="m-0 p-0 bg-transparent font-mono">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content text-zinc-300 font-sans text-[12px] leading-relaxed select-text ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: ({ children }) => (
            <h1 className="text-sm font-mono font-bold text-zinc-100 tracking-wide mt-4 mb-2 pb-1 border-b border-zinc-800/80 flex items-center gap-1.5">
              <span className="text-emerald-400">#</span> {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-mono font-bold text-zinc-200 tracking-wide mt-3.5 mb-1.5 flex items-center gap-1.5">
              <span className="text-emerald-400">##</span> {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-mono font-semibold text-zinc-200 mt-2.5 mb-1 flex items-center gap-1">
              <span className="text-emerald-500">###</span> {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[11px] font-mono font-semibold text-zinc-300 mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed text-zinc-300 text-[11px]">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100 font-mono text-[11px]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-zinc-300 italic font-sans">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="my-2 pl-4 space-y-1 list-disc marker:text-emerald-500/70 text-zinc-300 text-[11px]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 pl-4 space-y-1 list-decimal marker:text-emerald-400 font-mono text-[11px] text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed font-sans text-zinc-300 text-[11px]">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 pl-3 py-1 border-l-2 border-emerald-500/70 bg-emerald-950/15 text-zinc-400 font-sans text-[11px] italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto border border-zinc-800 bg-zinc-950/60 rounded-none scrollbar-thin">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-semibold text-zinc-300 border-r border-zinc-800 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-zinc-900 border-r border-zinc-900/60 last:border-r-0 text-zinc-300">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-zinc-800/80" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}