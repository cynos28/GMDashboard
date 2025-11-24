'use client';

import { DomainConfig } from '@/components/dashboard/domain-config';

export default function MeasurementPage() {
  const strands = [
    {
      name: 'length',
      units: [
        { label: 'mm', enabled: true },
        { label: 'cm', enabled: true },
        { label: 'm', enabled: true },
        { label: 'km', enabled: false },
      ],
      tolerance: 5,
      hintsVisible: true,
      difficulty: 'medium' as const,
    },
    {
      name: 'area',
      units: [
        { label: 'cm²', enabled: true },
        { label: 'm²', enabled: true },
        { label: 'km²', enabled: false },
      ],
      tolerance: 8,
      hintsVisible: true,
      difficulty: 'medium' as const,
    },
    {
      name: 'capacity',
      units: [
        { label: 'ml', enabled: true },
        { label: 'L', enabled: true },
        { label: 'kL', enabled: false },
      ],
      tolerance: 10,
      hintsVisible: true,
      difficulty: 'easy' as const,
    },
    {
      name: 'weight',
      units: [
        { label: 'g', enabled: true },
        { label: 'kg', enabled: true },
        { label: 't', enabled: false },
      ],
      tolerance: 5,
      hintsVisible: true,
      difficulty: 'medium' as const,
    },
  ];

  return (
    <DomainConfig
      title="Measurement"
      description="Configure units, difficulty, and scaffolds for measurement practice using AR tools"
      strands={strands}
      accentColor="#3B82F6"
    />
  );
}
