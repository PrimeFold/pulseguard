"use client";

import { useState, useEffect } from "react";
import {
  updateAiSettings,
  removeCustomAiKey,
  fetchLiveProviderModels,
} from "@/app/api/action/ai-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Key,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Globe,
  Radio,
} from "lucide-react";

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
  { id: "openrouter", name: "OpenRouter", keyPrefix: "sk-or-..." },
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
  const [embeddingModel, setEmbeddingModel] = useState(
    initialEmbeddingModel || "text-embedding-004",
  );
  const [apiKey, setApiKey] = useState("");
  const [apiKeyDisplay, setApiKeyDisplay] = useState<string | null>(
    initialApiKeyDisplay,
  );

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableEmbeddings, setAvailableEmbeddings] = useState<string[]>([]);
  const [modelsSource, setModelsSource] = useState<"live_api" | "fallback">(
    "fallback",
  );
  const [fetchingModels, setFetchingModels] = useState(false);
  const [customModelMode, setCustomModelMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selectedP = PROVIDERS.find((p) => p.id === provider);

  const loadModels = async (
    selectedProvider: string,
    userKey?: string,
    forceRefresh = false,
  ) => {
    setFetchingModels(true);
    try {
      const res = await fetchLiveProviderModels({
        provider: selectedProvider,
        apiKey: userKey || apiKey || undefined,
        organizationId,
        forceRefresh,
      });

      setAvailableModels(res.textModels);
      setAvailableEmbeddings(res.embeddingModels);
      setModelsSource(res.source);

      if (
        !res.textModels.includes(model) &&
        res.textModels.length > 0 &&
        !customModelMode
      ) {
        setModel(res.textModels[0]);
      }
      if (
        !res.embeddingModels.includes(embeddingModel) &&
        res.embeddingModels.length > 0
      ) {
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
        apiKey: apiKey || undefined,
      });

      if (!res.success) throw new Error(res.error);

      if (res.apiKeyDisplay) {
        setApiKeyDisplay(res.apiKeyDisplay);
        setApiKey("");
      }
      setMessage({ type: "success", text: "AI configuration saved." });

      if (apiKey) {
        loadModels(provider, apiKey, true);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Save failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!confirm("Remove the custom API key for this organization?")) return;
    setDeleting(true);
    try {
      await removeCustomAiKey({ organizationId });
      setApiKeyDisplay(null);
      setMessage({
        type: "success",
        text: "API key removed. Reverting to default.",
      });
      loadModels(provider, "", true);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to remove key.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border border-zinc-900 bg-black overflow-hidden relative">
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/50">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="text-sm font-mono font-semibold tracking-widest text-white uppercase">
            Model Configuration
          </h2>
        </div>
        <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
          Select inference engines. Bring your own API key to bypass rate
          limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="divide-y divide-zinc-900/50">
        {/* Provider Selection */}
        <div className="p-4 space-y-3">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            LLM Provider
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROVIDERS.map((p) => {
              const isSelected = provider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => canManage && handleProviderChange(p.id)}
                  className={`
                    p-3 border transition-colors cursor-pointer flex items-center justify-between group
                    ${!canManage ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"}
                    ${
                      isSelected
                        ? "bg-zinc-900 border-zinc-700"
                        : "bg-black border-zinc-900 hover:border-zinc-700"
                    }
                  `}
                >
                  <span
                    className={`text-[11px] font-mono font-medium ${isSelected ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}
                  >
                    {p.name}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* API Key Connection */}
        <div className="p-4 space-y-3 bg-zinc-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Key className="h-3.5 w-3.5" /> Provider API Key
            </label>
            {apiKeyDisplay && (
              <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                  Key Connected: {apiKeyDisplay}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="password"
              placeholder={selectedP?.keyPrefix || "Enter API Key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={!canManage}
              className="bg-black border-zinc-900 text-zinc-100 font-mono text-xs h-8 rounded-none placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-700 flex-1"
            />
            {canManage && apiKeyDisplay && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveKey}
                disabled={deleting}
                className="bg-transparent hover:bg-red-950/30 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 rounded-none h-8 font-mono text-[10px] uppercase tracking-widest px-4 transition-all"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                )}
                Revoke
              </Button>
            )}
          </div>
          <p className="text-[10px] font-mono text-zinc-600">
            Keys are symmetrically encrypted via AES-256-GCM before DB
            insertion.
          </p>
        </div>

        {/* Models Config */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-black">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Text / Reasoning Model
              </label>
              {fetchingModels && (
                <Loader2 className="h-3 w-3 animate-spin text-zinc-600" />
              )}
            </div>

            {customModelMode ? (
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!canManage}
                placeholder="e.g. gpt-4o"
                className="bg-zinc-950 border-zinc-900 text-zinc-300 font-mono text-[11px] h-8 rounded-none focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            ) : (
              <select
                value={model}
                onChange={(e) => {
                  if (e.target.value === "custom_input")
                    setCustomModelMode(true);
                  else setModel(e.target.value);
                }}
                disabled={!canManage || fetchingModels}
                className="w-full bg-zinc-950 border border-zinc-900 text-zinc-300 font-mono text-[11px] h-8 px-3 rounded-none focus:outline-none appearance-none"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                {!availableModels.includes(model) && (
                  <option value={model}>{model} (Current)</option>
                )}
                <option value="custom_input">-- Enter Custom ID --</option>
              </select>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Vector Embedding Model
            </label>
            <select
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              disabled={!canManage || fetchingModels}
              className="w-full bg-zinc-950 border border-zinc-900 text-zinc-300 font-mono text-[11px] h-8 px-3 rounded-none focus:outline-none appearance-none"
            >
              {availableEmbeddings.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              {!availableEmbeddings.includes(embeddingModel) && (
                <option value={embeddingModel}>
                  {embeddingModel} (Current)
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Messaging */}
        {message && (
          <div
            className={`p-4 border-b font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40"
                : "bg-red-950/20 text-red-400 border-red-900/40"
            }`}
          >
            <Radio className="h-3 w-3 animate-pulse" /> {message.text}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950/80 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 self-start">
            {modelsSource === "live_api" ? (
              <>
                <Globe className="h-3 w-3 text-blue-400" />
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                  LIVE API LIST
                </span>
              </>
            ) : (
              <>
                <Radio className="h-3 w-3 text-zinc-500" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  FALLBACK LIST
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadModels(provider, undefined, true)}
              disabled={fetchingModels || !canManage}
              className="bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 rounded-none h-8 font-mono text-[10px] uppercase tracking-widest px-3 active:scale-[0.98]"
            >
              <RefreshCw
                className={`h-3 w-3 mr-2 ${fetchingModels ? "animate-spin" : ""}`}
              />
              SYNC
            </Button>
            <Button
              type="submit"
              disabled={loading || !canManage}
              className="bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-[10px] font-bold tracking-widest uppercase rounded-none h-8 px-4 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              {loading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              SAVE CONFIG
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
