import { HandMetal } from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center"
            aria-hidden="true"
          >
            <HandMetal className="w-5 h-5 text-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              SignSpeak
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Sign Language → English
            </span>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/25 px-2.5 py-1 rounded-full">
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                aria-hidden="true"
              />
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background" id="main-content">
        {children}
      </main>

      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Use ASL gestures in front of your camera to translate.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors duration-200 focus-ring rounded"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
