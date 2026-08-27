"use client";

import { useState } from "react";
import { updateAiSettings, removeCustomAiKey } from "@/app/api/action/ai-settings";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Key, CheckCircle2, Loader2, ShieldCheck, Trash2 } from "lucide-react";

interface Props {
  organizationId: string;
  initialProvider: string;
  initialModel: string;
  initialEmbeddingModel: string;
  initialApiKeyDisplay: string | null;
  canManage: boolean;
}

const PROVIDER_PRESETS: Record<string, { models: string[]; embeddings: string[]; name: string; keyPrefix: string }> = {
  google: {
    name: "Google Gemini",
    models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-3.5-flash"],
    embeddings: ["text-embedding-004", "embedding-001"],
    keyPrefix: "AIzaSy...",
  },
  openai: {
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini"],
    embeddings: ["text-embedding-3-small", "text-embedding-3-large"],
    keyPrefix: "sk-proj-...",
  },
  anthropic: {
    name: "Anthropic Claude",
    models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
    embeddings: ["text-embedding-004"],
    keyPrefix: "sk-ant-...",
  },
  groq: {
    name: "Groq (Llama)",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    embeddings: ["text-embedding-004"],
    keyPrefix: "gsk_...",
  },
};

export function AiProviderCard({
  organizationId,
  initialProvider,
  initialModel,
  initialEmbeddingModel,
  initialApiKeyDisplay,
  canManage,
}: Props) {
  const [provider, setProvider] = useState(initialProvider || "google");
  const [model, setModel] = useState(initialModel || "gemini-1.5-flash");
  const [embeddingModel, setEmbeddingModel] = useState(initialEmbeddingModel || "text-embedding-004");
  const [apiKey, setApiKey] = useState("");
  const [apiKeyDisplay, setApiKeyDisplay] = useState<string | null>(initialApiKeyDisplay);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentPreset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.google;

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const preset = PROVIDER_PRESETS[newProvider];
    if (preset) {
      setModel(preset.models[0]);
      setEmbeddingModel(preset.embeddings[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await updateAiSettings({
        organizationId,
        provider,
        model,
        embeddingModel,
        apiKey: apiKey.trim() || undefined,
      });

      if (res.success) {
        if (res.apiKeyDisplay) {
          setApiKeyDisplay(res.apiKeyDisplay);
        }
        setApiKey("");
        setMessage({ type: "success", text: "AI provider and model configuration saved." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update AI settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async () => {
    setDeleting(true);
    setMessage(null);

    try {
      await removeCustomAiKey(organizationId);
      setApiKeyDisplay(null);
      setApiKey("");
      setMessage({ type: "success", text: "Custom API key removed. Reverted to system defaults." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to remove key." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="bg-black border-border shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-border flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-zinc-100" />
            </div>
            <div>
              <CardTitle className="text-base text-zinc-100">AI Model & Provider Configuration</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure your custom LLM provider, text generation model, embeddings, and API keys.
              </CardDescription>
            </div>
          </div>
          {apiKeyDisplay ? (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px] font-mono">
              <CheckCircle2 className="h-3 w-3" /> Custom Key Active
            </Badge>
          ) : (
            <Badge variant="outline" className="border-border bg-zinc-950 text-muted-foreground text-[11px]">
              System Default Key
            </Badge>
          )}
        </div>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="space-y-5">
          {/* Provider Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">AI Provider</label>
              <Select value={provider} onValueChange={(val) => handleProviderChange(val || "google")} disabled={!canManage}>
                <SelectTrigger className="bg-zinc-950 border-border text-xs text-zinc-100">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-border text-zinc-100">
                  {Object.entries(PROVIDER_PRESETS).map(([key, item]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection / Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">Text & SRE Agent Model</label>
              <Select value={model} onValueChange={(val) => setModel(val || model)} disabled={!canManage}>
                <SelectTrigger className="bg-zinc-950 border-border text-xs text-zinc-100 font-mono">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-border text-zinc-100">
                  {currentPreset.models.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs font-mono">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Embedding Model */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Embedding Model (Knowledge Base & RAG)</label>
            <Input
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              placeholder="e.g. text-embedding-004"
              disabled={!canManage}
              className="bg-zinc-950 border-border text-zinc-100 text-xs font-mono focus-visible:ring-1 focus-visible:ring-zinc-700"
            />
            <p className="text-[11px] text-muted-foreground">
              Used to generate mathematical vectors for document search and runbooks.
            </p>
          </div>

          {/* API Key Section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-zinc-400" /> Organization API Key
              </label>
              {apiKeyDisplay && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-border text-zinc-300">
                    {apiKeyDisplay}
                  </span>
                  {canManage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveKey}
                      disabled={deleting}
                      className="h-6 px-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    >
                      {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={apiKeyDisplay ? "Enter new API key to overwrite..." : `Paste your ${currentPreset.name} API key (${currentPreset.keyPrefix})`}
              disabled={!canManage}
              className="bg-zinc-950 border-border text-zinc-100 text-xs font-mono focus-visible:ring-1 focus-visible:ring-zinc-700"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
              <span>Keys are encrypted with AES-256 in PostgreSQL. Only the first 4 and last 4 characters are displayed.</span>
            </div>
          </div>

          {message && (
            <p className={`text-xs font-medium ${message.type === "success" ? "text-emerald-500" : "text-red-500"}`}>
              {message.text}
            </p>
          )}
        </CardContent>

        {canManage && (
          <CardFooter className="border-t border-border pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-white hover:bg-zinc-200 text-black border border-transparent font-medium text-xs gap-1.5"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save AI Configuration
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
