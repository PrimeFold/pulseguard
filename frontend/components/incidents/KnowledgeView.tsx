"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Loader2, BookOpen } from "lucide-react";
import { getRecentDocuments, uploadDocumentAction } from "@/app/api/action/document";

interface KnowledgeViewProps {
  organizationId: string;
}

export function KnowledgeView({ organizationId }: KnowledgeViewProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [organizationId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getRecentDocuments(organizationId);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("type", "RUNBOOK");
      formData.append("organizationId", organizationId);

      await uploadDocumentAction(formData);
      await loadDocuments(); // Reload after upload
    } catch (err) {
      console.error(err);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
      <div className="p-6 border-b border-zinc-900 shrink-0">
        <h3 className="text-zinc-200 font-mono text-sm uppercase tracking-widest font-semibold flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-emerald-400" />
          Knowledge & Runbooks
        </h3>
        <label className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors cursor-pointer group rounded-none">
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin mb-3" />
          ) : (
            <Upload className="h-6 w-6 text-zinc-500 group-hover:text-emerald-400 mb-3 transition-colors" />
          )}
          <span className="text-xs font-mono text-zinc-400 text-center uppercase tracking-widest">
            {isUploading ? "Ingesting Document..." : "Upload Runbook (.md, .txt, .pdf)"}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".md,.txt,.pdf"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950/30">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
          Indexed Documents
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-zinc-600 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-[11px] text-zinc-600 font-mono text-center py-8 border border-zinc-900/50 bg-zinc-950/50">
            No knowledge indexed yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map(doc => (
              <div key={doc.id} className="p-3 bg-black border border-zinc-900 flex items-start gap-3 hover:border-zinc-700 transition-colors">
                <FileText className="h-4 w-4 text-emerald-500/70 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-zinc-200 font-mono truncate" title={doc.title}>
                    {doc.title}
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono mt-1.5 flex justify-between">
                    <span className="px-1.5 py-0.5 bg-zinc-900 rounded-none uppercase">{doc.type}</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
