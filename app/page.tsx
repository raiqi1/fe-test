"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Upload,
  RefreshCw,
  Database,
  MessageSquare,
  Sparkles,
  FileText,
  Globe,
  Clock,
  Loader2,
} from "lucide-react";

// Types
interface Message {
  type: "user" | "assistant";
  content: string;
  sources?: Source[];
  response_time_ms?: number;
  timestamp: number;
}

interface Source {
  type: "document" | "website";
  name: string;
  page?: number;
  url?: string;
}

interface KnowledgeBaseInfo {
  document_loaded: boolean;
  website_scraped: boolean;
  total_chunks: number;
  last_update: string | null;
  sources: Array<{
    type: string;
    name: string;
    pages?: number;
    urls?: number;
  }>;
}

interface SystemStatus {
  ready: boolean;
  knowledge_base: KnowledgeBaseInfo;
  total_messages: number;
  message: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch system status
  useEffect(() => {
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      type: "user",
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage("");

    try {
      const formData = new FormData();
      formData.append("question", inputMessage);
      // Use optimized default settings
      formData.append("use_hybrid", "true");
      formData.append("use_query_rewriting", "true");
      formData.append("use_reranking", "true");
      formData.append("rerank_top_k", "5");
      formData.append("dense_weight", "0.5");
      formData.append("sparse_weight", "0.5");

      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Clean up markdown formatting (remove ** bold markers)
      const cleanedAnswer = data.answer.replace(/\*\*/g, '');

      const assistantMessage: Message = {
        type: "assistant",
        content: cleanedAnswer,
        sources: data.sources,
        response_time_ms: data.response_time_ms,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        type: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload-greenlock-doc`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Show success message in chat
      const successMessage: Message = {
        type: "assistant",
        content: `✅ Document "${file.name}" uploaded successfully! The knowledge base has been updated.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, successMessage]);

      fetchStatus();
    } catch (error) {
      console.error("Error uploading document:", error);
      const errorMessage: Message = {
        type: "assistant",
        content: "❌ Failed to upload document. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRefreshWebsite = async () => {
    setIsRefreshing(true);

    const refreshMessage: Message = {
      type: "assistant",
      content: "🔄 Refreshing website content... This may take a minute.",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, refreshMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/refresh-website`, {
        method: "POST",
      });
      const data = await response.json();

      const successMessage: Message = {
        type: "assistant",
        content: "✅ Website content refreshed successfully! Latest information is now available.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, successMessage]);

      fetchStatus();
    } catch (error) {
      console.error("Error refreshing website:", error);
      const errorMessage: Message = {
        type: "assistant",
        content: "❌ Failed to refresh website. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Greenlock AI
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your Investment Insights Assistant
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            {systemStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                <div
                  className={`w-2 h-2 rounded-full ${systemStatus.ready
                      ? "bg-green-500 animate-pulse"
                      : "bg-yellow-500"
                    }`}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {systemStatus.ready ? "Online" : "Loading..."}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-[calc(100vh-180px)] flex flex-col">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Chat
                  </h2>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Welcome to Greenlock AI
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                      Ask me anything about investment fees, portfolio management,
                      or Greenlock's services. I'm here to help!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                      <button
                        onClick={() => setInputMessage("What is Greenlock?")}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition"
                      >
                        What is Greenlock?
                      </button>
                      <button
                        onClick={() => setInputMessage("Tell me about investment fees")}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition"
                      >
                        Investment fees
                      </button>
                      <button
                        onClick={() => setInputMessage("How does portfolio analysis work?")}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition"
                      >
                        Portfolio analysis
                      </button>
                      <button
                        onClick={() => setInputMessage("What are hidden fees in private equity?")}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition"
                      >
                        Hidden fees
                      </button>
                      <button
                        onClick={() => setInputMessage("How can I reduce investment costs?")}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition"
                      >
                        Reduce costs
                      </button>
                      <button
                        onClick={() => setInputMessage("What is fee transparency?")}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition"
                      >
                        Fee transparency
                      </button>
                      <button
                        onClick={() => setInputMessage("How do hedge funds charge fees?")}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition"
                      >
                        Hedge fund fees
                      </button>
                      <button
                        onClick={() => setInputMessage("What services does Greenlock offer?")}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition"
                      >
                        Greenlock services
                      </button>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.type === "user"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {/* Assistant Message Metadata */}
                      {message.type === "assistant" && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            📚 Sources:
                          </p>
                          <div className="space-y-1">
                            {message.sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400"
                              >
                                {source.type === "document" ? (
                                  <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                )}
                                <span className="break-words">
                                  {source.name}
                                  {source.page && ` (Page ${source.page})`}
                                </span>
                              </div>
                            ))}
                          </div>
                          {message.response_time_ms && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
                              <Clock className="w-3 h-3" />
                              <span>{message.response_time_ms}ms</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Ask about Greenlock..."
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center gap-2 font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Powered by advanced AI with hybrid search and re-ranking
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Knowledge Base Status */}
            {systemStatus && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Knowledge Base
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Status
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${systemStatus.ready
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                      {systemStatus.ready ? "Ready" : "Loading"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Total Content
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {systemStatus.knowledge_base.total_chunks} chunks
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2 rounded-lg text-center ${systemStatus.knowledge_base.document_loaded
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-slate-50 dark:bg-slate-700"
                        }`}>
                        <FileText className={`w-4 h-4 mx-auto mb-1 ${systemStatus.knowledge_base.document_loaded
                            ? "text-green-600 dark:text-green-400"
                            : "text-slate-400"
                          }`} />
                        <div className={`font-medium ${systemStatus.knowledge_base.document_loaded
                            ? "text-green-700 dark:text-green-300"
                            : "text-slate-600 dark:text-slate-400"
                          }`}>
                          Documents
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg text-center ${systemStatus.knowledge_base.website_scraped
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "bg-slate-50 dark:bg-slate-700"
                        }`}>
                        <Globe className={`w-4 h-4 mx-auto mb-1 ${systemStatus.knowledge_base.website_scraped
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400"
                          }`} />
                        <div className={`font-medium ${systemStatus.knowledge_base.website_scraped
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-slate-600 dark:text-slate-400"
                          }`}>
                          Website
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    onChange={handleUploadDocument}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload Document</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRefreshWebsite}
                    disabled={isRefreshing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-sm font-medium">Refresh Website</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                💡 Tips
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Ask specific questions for better answers</li>
                <li>• Upload documents to expand knowledge</li>
                <li>• Check sources for verification</li>
                <li>• Refresh website for latest content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}