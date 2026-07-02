import { WEDDING_WIZARD_STEPS, BIRTHDAY_WIZARD_STEPS } from '@/src/constants';
import { supabase } from '@/src/lib/supabase';
import type { PackageInclusion, PackageTier } from '@/src/types/database';
export interface WizardStep {
  key: string;
  label: string;
  table: string | null;
}

export function getWizardStepsForEventType(eventType: string): WizardStep[] {
  return eventType === 'wedding' ? WEDDING_WIZARD_STEPS : BIRTHDAY_WIZARD_STEPS;
}

export function getActiveWizardSteps(
  eventType: string,
  inclusions: Pick<PackageInclusion, 'service_type' | 'included'>[]
): WizardStep[] {
  const allSteps = getWizardStepsForEventType(eventType);

  if (!inclusions.length) {
    return allSteps;
  }

  const includedKeys = new Set(
    inclusions.filter((i) => i.included).map((i) => i.service_type)
  );

  const hasIncludedSteps = includedKeys.size > 0;
  if (!hasIncludedSteps) {
    return allSteps;
  }

  const filteredSteps = allSteps.filter((step) => step.key === 'review' || includedKeys.has(step.key));
  return filteredSteps.length > 0 ? filteredSteps : allSteps;
}

export function getInclusionLabels(
  eventType: string,
  inclusions: Pick<PackageInclusion, 'service_type' | 'included'>[]
): string[] {
  const allSteps = getWizardStepsForEventType(eventType);
  const labelByKey = Object.fromEntries(allSteps.map((s) => [s.key, s.label]));

  return inclusions
    .filter((i) => i.included)
    .map((i) => labelByKey[i.service_type] ?? i.service_type);
}

export async function fetchPackageInclusions(
  packageId: string
): Promise<PackageInclusion[]> {
  const { data, error } = await supabase
    .from('package_inclusions')
    .select('*')
    .eq('package_id', packageId);

  if (error) throw error;
  return (data ?? []) as PackageInclusion[];
}

const WEDDING_TIER_QUALITY: Record<PackageTier, string[]> = {
  bronze: [
    'Cake: 1–2 tier',
    'Decorations: basic',
    'Makeup: basic MUA, no trial',
    'Dress: simple rental gowns',
    'Suit: basic black/navy',
    'Videography: not included',
    'Bridal car: not included',
  ],
  silver: [
    'Cake: 3 tier',
    'Decorations: themed',
    'Makeup: trial + glam',
    'Dress: mid-range designer',
    'Suit: tailored modern',
    'Videography: included',
    'Bridal car: not included',
  ],
  gold: [
    'Cake: 4–5 tier',
    'Decorations: luxury',
    'Makeup: premium artist, full day',
    'Dress: couture / premium',
    'Suit: tuxedo / luxury linen',
    'Videography: included (premium)',
    'Bridal car: included',
  ],
};

export function getWeddingTierQualityNotes(tier: PackageTier): string[] {
  return WEDDING_TIER_QUALITY[tier] ?? WEDDING_TIER_QUALITY.bronze;
}
