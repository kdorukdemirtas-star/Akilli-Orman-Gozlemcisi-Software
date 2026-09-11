import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { COPY } from "./uiCopy.js";

export const LANG_KEY = "aog-lang";

export function asLang(raw) {
  return raw === "en" ? "en" : "tr";
}

export function readLang(storage) {
  try {
    const box = storage ?? globalThis.localStorage;
    return asLang(box?.getItem(LANG_KEY));
  } catch {
    return "tr";
  }
}

export function writeLang(lang, storage) {
  const next = asLang(lang);
  try {
    const box = storage ?? globalThis.localStorage;
    box?.setItem(LANG_KEY, next);
  } catch {
    /* private mode */
  }
  if (typeof document !== "undefined") document.documentElement.lang = next;
  return next;
}

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => readLang());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(writeLang(next));
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, copy: COPY[lang] }),
    [lang, setLang],
  );

  return createElement(LangContext.Provider, { value }, children);
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("LangProvider missing");
  return ctx;
}
