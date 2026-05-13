export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

const DEFAULT_OPTIONS: Required<SpeechOptions> = {
  rate: 0.95,
  pitch: 1.0,
  volume: 1.0,
  lang: "en-US",
};

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(
  text: string,
  options: SpeechOptions = {},
): SpeechSynthesisUtterance | null {
  if (!isSpeechSupported() || !text.trim()) return null;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const merged = { ...DEFAULT_OPTIONS, ...options };
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = merged.rate;
  utterance.pitch = merged.pitch;
  utterance.volume = merged.volume;
  utterance.lang = merged.lang;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return isSpeechSupported() && window.speechSynthesis.speaking;
}
