import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: "" };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error (in production, send to error tracking service)
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack || "",
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: "" });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: "" });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] dark:bg-[#0f1117] p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-[24px] text-[#1a1a2e] dark:text-white mb-2" style={{ fontWeight: 800 }}>
              Oops! Có lỗi xảy ra
            </h1>
            <p className="text-[16px] text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
            </p>

            {this.state.error && (
              <div className="bg-red-50 dark:bg-red-500/5 border border-red-200/50 dark:border-red-500/20 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-red-500" />
                  <span className="text-[16px] text-red-600 dark:text-red-400" style={{ fontWeight: 600 }}>Chi tiết lỗi</span>
                </div>
                <p className="text-[16px] text-red-600/80 dark:text-red-400/80 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-gradient-to-r from-[#dc2f3c] to-[#dc2f3c]/90 text-white px-5 py-3 rounded-xl text-[15.5px] shadow-lg shadow-[#dc2f3c]/20 hover:shadow-xl hover:shadow-[#dc2f3c]/25 transition-all"
                style={{ fontWeight: 600 }}
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 bg-[#f4f5f7] dark:bg-white/5 text-[#1a1a2e] dark:text-white px-5 py-3 rounded-xl text-[15.5px] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Home className="w-4 h-4" />
                Trang chủ
              </button>
            </div>

            <p className="text-[15px] text-gray-400 dark:text-gray-500 mt-8">
              Nếu lỗi tiếp tục xảy ra, vui lòng liên hệ{" "}
              <a href="mailto:support@ieltspro.vn" className="text-[#dc2f3c] hover:underline">
                support@ieltspro.vn
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

