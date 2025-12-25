"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchPrices, getMockPrices, type PriceData } from "@/lib/prices"

export function usePrices() {
  return useQuery<PriceData>({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    placeholderData: getMockPrices(),
  })
}
