"use client";

import { useEffect, useRef, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

export function useLocalState<T>(key: string, fallback: T) {
  const fallbackRef = useRef(fallback);
  const [state, setState] = useState<T>(fallbackRef.current);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStorage(key, fallbackRef.current));
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(key, state);
  }, [hydrated, key, state]);

  return { state, setState, hydrated };
}
