import { createActor } from "@/backend";
import type { Translation } from "@/types/translation";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface TranslationActor {
  getRecentTranslations: () => Promise<
    Array<{ id: bigint; text: string; confidence: number; timestamp: bigint }>
  >;
  addTranslation: (
    text: string,
    confidence: number,
    timestamp: bigint,
  ) => Promise<bigint>;
  deleteTranslation: (id: bigint) => Promise<boolean>;
  clearTranslations: () => Promise<void>;
}

const QUERY_KEY = ["translations"] as const;

export function useGetRecentTranslations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Translation[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as TranslationActor
      ).getRecentTranslations() as Promise<Translation[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5_000,
  });
}

export function useAddTranslation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      text,
      confidence,
      timestamp,
    }: {
      text: string;
      confidence: number;
      timestamp: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as unknown as TranslationActor).addTranslation(
        text,
        confidence,
        timestamp,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteTranslation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as unknown as TranslationActor).deleteTranslation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useClearTranslations() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as unknown as TranslationActor).clearTranslations();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
