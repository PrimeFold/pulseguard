"use client";

import { useState, useEffect, useTransition } from "react";
import { updateAiSettings, removeCustomAiKey, fetchLiveProviderModels } from "@/app/api/action/ai-settings";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Key, CheckCircle2, Loader2, ShieldCheck, Trash2, RefreshCw, Globe, Radio } from "lucide-react";

interface Props {
  organizationId: string;
  initialProvider: string;
  initialModel: string;
  initialEmbeddingModel: string;
  initialApiKeyDisplay: string | null;
  canManage: boolean;
}

const PROVIDERS = [
  { id: "google", name: "Google Gemini", keyPrefix: "AIzaSy..." },
  { id: "openai", name: "OpenAI", keyPrefix: "sk-proj-..." },
  { id: "anthropic", name: "Anthropic Claude", keyPrefix: "sk-ant-..." },
  { id: "groq", name: "Groq (Llama / Mixtral)", keyPrefix: "gsk_..." },
  { id: "openrouter", name: "OpenRouter (Multi-Model)", keyPrefix: "sk-or-..." },
];

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
  
  // Live models fetched from provider public APIs
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableEmbeddings, setAvailableEmbeddings] = useState<string[]>([]);
  const [modelsSource, setModelsSource] = useState<"live_api" | "fallback">("fallback");
  const [fetchingModels, setFetchingModels] = useState(false);
  const [customModelMode, setCustomModelMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load models dynamically from provider APIs
  const loadModels = async (selectedProvider: string, userKey?: string) => {
    setFetchingModels(true);
    try {
      const res = await fetchLiveProviderModels({
        provider: selectedProvider,
        apiKey: userKey || apiKey || undefined,
        organizationId,
      });

      setAvailableModels(res.textModels);
      setAvailableEmbeddings(res.embeddingModels);
      setModelsSource(res.source);

      // If the current model isn't in the fetched list, default to the first one unless it was user-typed
      if (!res.textModels.includes(model) && res.textModels.length > 0 && !customModelMode) {
        setModel(res.textModels[0]);
      }
      if (!res.embeddingModels.includes(embeddingModel) && res.embeddingModels.length > 0) {
        setEmbeddingModel(res.embeddingModels[0]);
      }
    } catch {
      // Keep existing
    } finally {
      setFetchingModels(false);
    }
  };

  useEffect(() => {
    loadModels(provider);
  }, [provider]);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    setCustomModelMode(false);
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
        // Re-fetch with saved key
        loadModels(provider);
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
      loadModels(provider);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to remove key." });
    } finally {
      setDeleting(false);
    }
  };

  const currentProviderInfo = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

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
                Fetches live models dynamically from official provider APIs.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {modelsSource === "live_api" ? (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px] font-mono">
                <Globe className="h-3 w-3" /> Live Provider API
              </Badge>
            ) : (
              <Badge variant="outline" className="border-border bg-zinc-950 text-muted-foreground text-[11px] gap-1 font-mono">
                <Radio className="h-3 w-3 text-zinc-500" /> Cached Defaults
              </Badge>
            )}
            {apiKeyDisplay && (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px] font-mono">
                <CheckCircle2 className="h-3 w-3" /> Custom Key
              </Badge>
            )}
          </div>
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
                  {PROVIDERS.map((item) => (
                    <SelectItem key={item.id} value={item.id} className="text-xs">
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection / Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Text & SRE Agent Model</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadModels(provider)}
                    disabled={fetchingModels}
                    className="text-[11px] text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${fetchingModels ? "animate-spin" : ""}`} /> Refresh Models
                  </button>
                  <span className="text-zinc-700">|</span>
                  <button
                    type="button"
                    onClick={() => setCustomModelMode(!customModelMode)}
                    className="text-[11px] text-muted-foreground hover:text-white transition-colors"
                  >
                    {customModelMode ? "Choose from list" : "Type custom"}
                  </button>
                </div>
              </div>

              {customModelMode ? (
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. gpt-4o-2024-11-20 or gemini-2.0-flash"
                  disabled={!canManage}
                  className="bg-zinc-950 border-border text-zinc-100 text-xs font-mono focus-visible:ring-1 focus-visible:ring-zinc-700"
                />
              ) : (
                <Select value={model} onValueChange={(val) => setModel(val || model)} disabled={!canManage || fetchingModels}>
                  <SelectTrigger className="bg-zinc-950 border-border text-xs text-zinc-100 font-mono">
                    <SelectValue placeholder={fetchingModels ? "Fetching live models..." : "Select Model"} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-border text-zinc-100 max-h-64">
                    {availableModels.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs font-mono">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Embedding Model */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Embedding Model (Knowledge Base & RAG)</label>
            {availableEmbeddings.length > 0 && !customModelMode ? (
              <Select value={embeddingModel} onValueChange={(val) => setEmbeddingModel(val || embeddingModel)} disabled={!canManage}>
                <SelectTrigger className="bg-zinc-950 border-border text-xs text-zinc-100 font-mono">
                  <SelectValue placeholder="Select Embedding Model" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-border text-zinc-100">
                  {availableEmbeddings.map((emb) => (
                    <SelectItem key={emb} value={emb} className="text-xs font-mono">
                      {emb}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                placeholder="e.g. text-embedding-004 or text-embedding-3-small"
                disabled={!canManage}
                className="bg-zinc-950 border-border text-zinc-100 text-xs font-mono focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            )}
            <p className="text-[11px] text-muted-foreground">
              Embeddings convert internal runbooks and documentation into mathematical vectors in pgvector.
            </p>
          </div>

          {/* API Key Section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-zinc-400" /> {currentProviderInfo.name} API Key
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

            <div className="flex gap-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={apiKeyDisplay ? "Enter new API key to overwrite..." : `Paste your ${currentProviderInfo.name} API key (${currentProviderInfo.keyPrefix})`}
                disabled={!canManage}
                className="bg-zinc-950 border-border text-zinc-100 text-xs font-mono focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
              {apiKey && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadModels(provider, apiKey)}
                  disabled={fetchingModels}
                  className="shrink-0 text-xs border-border bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
                >
                  {fetchingModels ? <Loader2 className="h-3 w-3 animate-spin" /> : "Fetch Models with Key"}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
              <span>Keys are encrypted with AES-256. Only the first 4 and last 4 characters are ever displayed in the UI.</span>
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
