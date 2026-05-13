import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddTranslation,
  useClearTranslations,
  useDeleteTranslation,
  useGetRecentTranslations,
} from "@/hooks/useTranslations";
import {
  confidenceColor,
  confidenceLabel,
  toTranslationDisplay,
} from "@/types/translation";
import {
  isSpeaking,
  isSpeechSupported,
  speak,
  stopSpeaking,
} from "@/utils/speech";
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  Copy,
  ImageIcon,
  RefreshCw,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Simulated ASL gesture detection — maps frames to example translations
const DEMO_TRANSLATIONS = [
  { text: "Hello, how are you?", confidence: 0.94 },
  { text: "My name is Alex.", confidence: 0.88 },
  { text: "Nice to meet you.", confidence: 0.91 },
  { text: "Thank you very much.", confidence: 0.85 },
  { text: "Please help me.", confidence: 0.79 },
  { text: "I understand.", confidence: 0.96 },
  { text: "Good morning!", confidence: 0.92 },
];

export function TranslatorPage() {
  const [currentTranslation, setCurrentTranslation] = useState<string>("");
  const [currentConfidence, setCurrentConfidence] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(isSpeechSupported());
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<Error | null>(null);
  const translationIndexRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check browser support for camera
  const isSupported =
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
      }
    };
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setCameraLoading(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      return true;
    } catch (err) {
      setCameraError(
        err instanceof Error ? err : new Error("Camera access denied"),
      );
      return false;
    } finally {
      setCameraLoading(false);
    }
  }, [isSupported]);

  const stopCamera = useCallback(async () => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const { mutateAsync: addTranslation } = useAddTranslation();
  const { data: translations, isLoading: historyLoading } =
    useGetRecentTranslations();
  const { mutateAsync: deleteTranslation, isPending: isDeleting } =
    useDeleteTranslation();
  const { mutateAsync: clearTranslations, isPending: isClearing } =
    useClearTranslations();

  const handleToggleCamera = useCallback(async () => {
    if (isActive) {
      await stopCamera();
      setIsTranslating(false);
      setCurrentTranslation("");
    } else {
      const ok = await startCamera();
      if (!ok) toast.error("Could not access camera. Check permissions.");
    }
  }, [isActive, startCamera, stopCamera]);

  const handleCapture = useCallback(async () => {
    if (!isActive || isTranslating) return;
    setIsTranslating(true);
    try {
      // Simulate gesture recognition (300-800ms)
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
      const entry =
        DEMO_TRANSLATIONS[
          translationIndexRef.current % DEMO_TRANSLATIONS.length
        ];
      translationIndexRef.current += 1;
      setCurrentTranslation(entry.text);
      setCurrentConfidence(entry.confidence);

      const now = BigInt(Date.now()) * 1_000_000n;
      await addTranslation({
        text: entry.text,
        confidence: entry.confidence,
        timestamp: now,
      });

      if (speakEnabled && entry.text) {
        setAudioPlaying(true);
        const utt = speak(entry.text);
        if (utt) {
          utt.onend = () => setAudioPlaying(false);
          utt.onerror = () => setAudioPlaying(false);
        } else {
          setAudioPlaying(false);
        }
      }

      toast.success("Translation captured", { duration: 2000 });
    } catch {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  }, [isActive, isTranslating, addTranslation, speakEnabled]);

  const handleReplay = useCallback(() => {
    if (!currentTranslation) return;
    if (isSpeaking()) {
      stopSpeaking();
      setAudioPlaying(false);
    } else {
      setAudioPlaying(true);
      const utt = speak(currentTranslation);
      if (utt) {
        utt.onend = () => setAudioPlaying(false);
        utt.onerror = () => setAudioPlaying(false);
      } else {
        setAudioPlaying(false);
      }
    }
  }, [currentTranslation]);

  const handleDeleteEntry = useCallback(
    async (id: bigint) => {
      try {
        await deleteTranslation(id);
      } catch {
        toast.error("Could not delete entry.");
      }
    },
    [deleteTranslation],
  );

  const handleCopyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied to clipboard", { duration: 2000 }),
      () => toast.error("Could not copy to clipboard."),
    );
  }, []);

  const handleClearAll = useCallback(async () => {
    try {
      await clearTranslations();
      setCurrentTranslation("");
      setCurrentConfidence(0);
      toast.success("History cleared");
    } catch {
      toast.error("Could not clear history.");
    }
  }, [clearTranslations]);

  const displayTranslations = translations?.map(toTranslationDisplay) ?? [];

  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6"
      data-ocid="translator.page"
    >
      {/* Two-column layout on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Section */}
        <section
          aria-labelledby="camera-heading"
          className="card-section flex flex-col gap-4"
          data-ocid="camera.panel"
        >
          <div className="flex items-center justify-between">
            <h2
              id="camera-heading"
              className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Camera Input
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCamera}
              disabled={cameraLoading || isSupported === false}
              className="gap-1.5 text-xs focus-ring"
              data-ocid="camera.toggle_button"
              aria-label={isActive ? "Stop camera" : "Start camera"}
            >
              {isActive ? (
                <CameraOff className="w-4 h-4" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {cameraLoading ? "Starting…" : isActive ? "Stop" : "Start"}
            </Button>
          </div>

          {/* Camera Preview */}
          <div className="camera-container relative" aria-live="polite">
            {isSupported === false && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80 rounded-lg"
                role="alert"
              >
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm text-foreground font-medium text-center px-4">
                  Camera not supported in this browser.
                </p>
              </div>
            )}

            {cameraError && !cameraLoading && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80 rounded-lg"
                role="alert"
                data-ocid="camera.error_state"
              >
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm text-foreground font-medium text-center px-4">
                  {cameraError.message}
                </p>
              </div>
            )}

            {!isActive && !cameraError && isSupported !== false && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                data-ocid="camera.empty_state"
              >
                <img
                  src="/assets/generated/sign-language-hero.dim_800x600.png"
                  alt="Sign language hands illustration"
                  className="w-40 h-32 object-cover opacity-40 rounded"
                />
                <p className="text-sm text-muted-foreground">
                  Press Start to enable camera
                </p>
              </div>
            )}

            {cameraLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                data-ocid="camera.loading_state"
              >
                <RefreshCw
                  className="w-8 h-8 text-primary animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Camera loading…</span>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              aria-label="Camera preview"
              style={{ display: isActive ? "block" : "none" }}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Capture Button */}
          <div className="relative">
            <Button
              onClick={handleCapture}
              disabled={!isActive || isTranslating || cameraLoading}
              className="w-full btn-primary gap-2 py-5 text-base transition-smooth"
              data-ocid="translator.capture_button"
              aria-label={
                isTranslating ? "Translating…" : "Capture and translate sign"
              }
            >
              {isTranslating ? (
                <>
                  <RefreshCw
                    className="w-5 h-5 animate-spin"
                    aria-hidden="true"
                  />{" "}
                  Translating…
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" aria-hidden="true" /> Capture
                  Sign
                </>
              )}
            </Button>
            <span aria-live="polite" aria-atomic="true" className="sr-only">
              {isTranslating ? "Translating sign language…" : ""}
            </span>
          </div>
        </section>

        {/* Translation Output Section */}
        <section
          aria-labelledby="output-heading"
          className="card-section flex flex-col gap-4"
          data-ocid="output.panel"
        >
          <div className="flex items-center justify-between">
            <h2
              id="output-heading"
              className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Translation
            </h2>
            <div className="flex items-center gap-2">
              {isSpeechSupported() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSpeakEnabled((v) => !v)}
                  className="gap-1.5 text-xs focus-ring"
                  data-ocid="output.speech_toggle"
                  aria-label={
                    speakEnabled ? "Disable auto-speak" : "Enable auto-speak"
                  }
                  aria-pressed={speakEnabled}
                >
                  {speakEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  {speakEnabled ? "Auto" : "Muted"}
                </Button>
              )}
            </div>
          </div>

          {/* Translation Display */}
          <AnimatePresence mode="wait">
            {currentTranslation ? (
              <motion.div
                key={currentTranslation}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-muted/40 border border-border rounded-lg p-5 flex flex-col gap-3"
                data-ocid="output.result_card"
                aria-live="assertive"
                aria-atomic="true"
              >
                <p className="font-mono text-xl font-medium text-foreground leading-relaxed break-words">
                  {currentTranslation}
                </p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className="w-4 h-4 text-accent"
                      aria-hidden="true"
                    />
                    <span
                      className={`text-sm font-medium ${confidenceColor(currentConfidence)}`}
                    >
                      {confidenceLabel(currentConfidence)} confidence
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(currentConfidence * 100)}%)
                    </span>
                  </div>
                  {isSpeechSupported() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReplay}
                      className="gap-1.5 text-xs focus-ring"
                      data-ocid="output.replay_button"
                      aria-label={
                        audioPlaying
                          ? "Stop speaking"
                          : "Replay translation audio"
                      }
                    >
                      {audioPlaying ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      {audioPlaying ? "Stop" : "Replay"}
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-center"
                data-ocid="output.empty_state"
              >
                <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center">
                  <Camera
                    className="w-7 h-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Start your camera and capture a sign to see the translation
                  here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* History Section */}
      <section
        aria-labelledby="history-heading"
        className="card-section flex flex-col gap-4"
        data-ocid="history.section"
      >
        <div className="flex items-center justify-between">
          <h2
            id="history-heading"
            className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Recent Translations
          </h2>
          {displayTranslations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isClearing}
              className="gap-1.5 text-xs text-destructive hover:text-destructive focus-ring"
              data-ocid="history.clear_button"
              aria-label="Clear all translation history"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>

        {historyLoading ? (
          <div className="space-y-2" data-ocid="history.loading_state">
            {["sk-1", "sk-2", "sk-3"].map((k) => (
              <Skeleton key={k} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : displayTranslations.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 gap-2"
            data-ocid="history.empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No translations yet. Capture a sign to get started.
            </p>
          </div>
        ) : (
          <ul className="space-y-2" data-ocid="history.list">
            {displayTranslations.map((item, idx) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between gap-3 bg-muted/30 border border-border/60 rounded-lg px-4 py-3 min-w-0"
                data-ocid={`history.item.${idx + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="font-mono text-sm text-foreground truncate"
                    title={item.text}
                  >
                    {item.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.timestamp.toLocaleTimeString()} ·{" "}
                    <span className={confidenceColor(item.confidence)}>
                      {Math.round(item.confidence * 100)}%
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-xs ${confidenceColor(item.confidence)}`}
                  >
                    {confidenceLabel(item.confidence)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyText(item.text)}
                    className="w-7 h-7 text-muted-foreground hover:text-foreground focus-ring"
                    data-ocid={`history.copy_button.${idx + 1}`}
                    aria-label={`Copy translation: ${item.text}`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEntry(BigInt(item.id))}
                    disabled={isDeleting}
                    className="w-7 h-7 text-muted-foreground hover:text-destructive focus-ring"
                    data-ocid={`history.delete_button.${idx + 1}`}
                    aria-label={`Delete translation: ${item.text}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
