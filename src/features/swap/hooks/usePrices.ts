"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPrices, getMockPrices } from "../api/prices";
import type { PriceData } from "../model/types";

export function usePrices() {
  return useQuery<PriceData>({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 15_000, // Consider data stale after 15 seconds
    placeholderData: getMockPrices(),
  });
}
