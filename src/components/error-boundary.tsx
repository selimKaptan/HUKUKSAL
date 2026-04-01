"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[JusticeGuard Error]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Bir hata oluştu</h2>
            <p className="text-sm text-slate-500 mb-6">Bu sayfa beklenmedik bir hatayla karşılaştı.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                Sayfayı Yenile
              </button>
              <button onClick={() => window.history.back()} className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50">
                Geri Dön
              </button>
            </div>
            {this.state.error && (
              <div className="mt-6">
                <button onClick={() => this.setState({ showDetails: !this.state.showDetails })} className="text-xs text-slate-400 hover:text-slate-600">
                  {this.state.showDetails ? "Gizle" : "Hata Detayı"}
                </button>
                {this.state.showDetails && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left">
                    <p className="text-xs text-red-600 font-mono break-all">{this.state.error.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
