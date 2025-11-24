'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Save, RotateCcw } from 'lucide-react';
import { ChartCard, MasteryBarChart } from '@/components/dashboard/charts';
import { mockMasteryData } from '@/data/mock-data';

interface UnitConfig {
  label: string;
  enabled: boolean;
}

interface StrandConfig {
  name: string;
  units: UnitConfig[];
  tolerance: number;
  hintsVisible: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DomainConfigProps {
  title: string;
  description: string;
  strands: StrandConfig[];
  accentColor: string;
}

export function DomainConfig({ title, description, strands, accentColor }: DomainConfigProps) {
  const [config, setConfig] = useState<StrandConfig[]>(strands);
  const [activeTab, setActiveTab] = useState(strands[0]?.name || '');
  const [profileName, setProfileName] = useState('');

  const updateStrand = (strandName: string, updates: Partial<StrandConfig>) => {
    setConfig((prev) =>
      prev.map((s) => (s.name === strandName ? { ...s, ...updates } : s))
    );
  };

  const toggleUnit = (strandName: string, unitLabel: string) => {
    setConfig((prev) =>
      prev.map((s) =>
        s.name === strandName
          ? {
              ...s,
              units: s.units.map((u) =>
                u.label === unitLabel ? { ...u, enabled: !u.enabled } : u
              ),
            }
          : s
      )
    );
  };

  const currentStrand = config.find((s) => s.name === activeTab);

  // Filter mastery data for this domain
  const domainMastery = mockMasteryData
    .filter((m) => strands.some((s) => s.name === m.strand))
    .map((m) => ({
      strand: m.strand,
      masteryPercentage: m.masteryPercentage,
      domain: m.domain,
    }));

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${strands.length}, 1fr)` }}>
              {strands.map((strand) => (
                <TabsTrigger key={strand.name} value={strand.name}>
                  {strand.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {config.map((strand) => (
              <TabsContent key={strand.name} value={strand.name} className="space-y-6">
                {/* Unit Toggles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Unit Selection</CardTitle>
                    <CardDescription>
                      Choose which units students can practice
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {strand.units.map((unit) => (
                        <div
                          key={unit.label}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <Label htmlFor={`unit-${unit.label}`} className="cursor-pointer">
                            {unit.label}
                          </Label>
                          <Switch
                            id={`unit-${unit.label}`}
                            checked={unit.enabled}
                            onCheckedChange={() => toggleUnit(strand.name, unit.label)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Difficulty & Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Settings</CardTitle>
                    <CardDescription>
                      Adjust challenge level and support options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Difficulty Presets */}
                    <div>
                      <Label>Difficulty Level</Label>
                      <div className="mt-2 flex gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((level) => (
                          <Button
                            key={level}
                            variant={strand.difficulty === level ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStrand(strand.name, { difficulty: level })}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Tolerance Slider */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Tolerance</Label>
                        <Badge variant="outline">{strand.tolerance}%</Badge>
                      </div>
                      <Slider
                        value={[strand.tolerance]}
                        onValueChange={([value]) =>
                          updateStrand(strand.name, { tolerance: value })
                        }
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Acceptable margin of error for measurements
                      </p>
                    </div>

                    {/* Hints Visibility */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={`hints-${strand.name}`}>Show Hints</Label>
                        <p className="text-sm text-neutral-500">
                          Allow students to request help
                        </p>
                      </div>
                      <Switch
                        id={`hints-${strand.name}`}
                        checked={strand.hintsVisible}
                        onCheckedChange={(checked) =>
                          updateStrand(strand.name, { hintsVisible: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Save as Lesson Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle>Save Configuration</CardTitle>
                    <CardDescription>
                      Save these settings as a reusable lesson profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Profile name (e.g., Week 1 - Length Basics)"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                      <Button className="gap-2">
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Live Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Performance</CardTitle>
              <CardDescription>
                {currentStrand?.name || 'Select a strand'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4" style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}>
                <p className="text-3xl font-bold">
                  {mockMasteryData.find((m) => m.strand === currentStrand?.name)?.averageAccuracy || 0}%
                </p>
                <p className="text-sm text-neutral-500">Current Class Accuracy</p>
              </div>

              <div className="rounded-lg border p-4" style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}>
                <p className="text-3xl font-bold">
                  {mockMasteryData.find((m) => m.strand === currentStrand?.name)?.averageTimeOnTask || 0}s
                </p>
                <p className="text-sm text-neutral-500">Avg Time on Task</p>
              </div>
            </CardContent>
          </Card>

          {domainMastery.length > 0 && (
            <ChartCard title="Mastery Overview" description="Performance across strands">
              <MasteryBarChart data={domainMastery} />
            </ChartCard>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button className="flex-1 gap-2" style={{ backgroundColor: accentColor }}>
              <Save className="h-4 w-4" />
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
