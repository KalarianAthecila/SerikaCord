"use client";

import { useState, useEffect, useCallback } from "react";

interface ExperimentVariant {
  id: string;
  name: string;
  config?: Record<string, unknown>;
}

interface ActiveExperiment {
  key: string;
  name: string;
  type: string;
  variant: ExperimentVariant | null;
}

interface UseExperimentResult {
  variant: ExperimentVariant | null;
  isLoading: boolean;
  error: string | null;
  isEnabled: boolean;
  isControl: boolean;
}

interface UseExperimentsResult {
  experiments: ActiveExperiment[];
  isLoading: boolean;
  error: string | null;
  getVariant: (key: string) => ExperimentVariant | null;
  isFeatureEnabled: (key: string) => boolean;
}

// Hook to get a single experiment variant
export function useExperiment(experimentKey: string): UseExperimentResult {
  const [variant, setVariant] = useState<ExperimentVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariant = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/experiments/variant/${experimentKey}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch experiment");
        }

        const data = await response.json();
        setVariant(data.variant);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setVariant(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (experimentKey) {
      fetchVariant();
    }
  }, [experimentKey]);

  return {
    variant,
    isLoading,
    error,
    isEnabled: variant !== null && variant.id !== "control",
    isControl: variant?.id === "control",
  };
}

// Hook to check if a feature flag is enabled
export function useFeatureFlag(featureKey: string): boolean {
  const { isEnabled } = useExperiment(featureKey);
  return isEnabled;
}

// Hook to get all active experiments for the current user
export function useExperiments(): UseExperimentsResult {
  const [experiments, setExperiments] = useState<ActiveExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/experiments/active", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch experiments");
        }

        const data = await response.json();
        setExperiments(data.experiments || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setExperiments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  const getVariant = useCallback(
    (key: string): ExperimentVariant | null => {
      const experiment = experiments.find((e) => e.key === key);
      return experiment?.variant ?? null;
    },
    [experiments]
  );

  const isFeatureEnabled = useCallback(
    (key: string): boolean => {
      const variant = getVariant(key);
      return variant !== null && variant.id !== "control";
    },
    [getVariant]
  );

  return {
    experiments,
    isLoading,
    error,
    getVariant,
    isFeatureEnabled,
  };
}

// Component wrapper for feature flags
interface FeatureFlagProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ feature, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(feature);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// A/B Test component
interface ABTestProps {
  experiment: string;
  variants: Record<string, React.ReactNode>;
  fallback?: React.ReactNode;
}

export function ABTest({ experiment, variants, fallback = null }: ABTestProps) {
  const { variant, isLoading } = useExperiment(experiment);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!variant) {
    return <>{fallback}</>;
  }

  const content = variants[variant.id];
  return <>{content ?? fallback}</>;
}
