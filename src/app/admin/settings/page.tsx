'use client';

import { useEffect, useMemo, useState } from 'react';

interface SettingDefinition {
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'number' | 'text' | 'email';
  defaultValue: any;
}

interface GlobalSetting {
  key: string;
  value: any;
  updated_at: string;
  description?: string;
}

const DEFINITIONS: SettingDefinition[] = [
  {
    key: 'registration_enabled',
    name: 'User registration',
    description: 'Allow new users to register for Kinjar accounts.',
    type: 'boolean',
    defaultValue: true,
  },
  {
    key: 'family_creation_enabled',
    name: 'Family creation',
    description: 'Permit family admins to spin up new private spaces.',
    type: 'boolean',
    defaultValue: true,
  },
  {
    key: 'max_families_per_user',
    name: 'Families per user',
    description: 'Limit how many families a single account can administer.',
    type: 'number',
    defaultValue: 5,
  },
  {
    key: 'max_upload_size_mb',
    name: 'Max upload size (MB)',
    description: 'Cap media uploads to keep storage predictable.',
    type: 'number',
    defaultValue: 150,
  },
  {
    key: 'maintenance_mode',
    name: 'Maintenance mode',
    description: 'Take Kinjar offline while you perform updates.',
    type: 'boolean',
    defaultValue: false,
  },
  {
    key: 'welcome_message',
    name: 'Welcome message',
    description: 'Message displayed to brand-new family members.',
    type: 'text',
    defaultValue: 'Welcome to Kinjar! Share a moment to get started.',
  },
  {
    key: 'support_email',
    name: 'Support email',
    description: 'Where families can reach the Kinjar team.',
    type: 'email',
    defaultValue: 'support@kinjar.com',
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, GlobalSetting>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const initial: Record<string, GlobalSetting> = {};
    DEFINITIONS.forEach((definition) => {
      initial[definition.key] = {
        key: definition.key,
        value: definition.defaultValue,
        updated_at: new Date().toISOString(),
        description: definition.description,
      };
    });
    setSettings(initial);
  }, []);

  const groupedSettings = useMemo(() => {
    return {
      platform: DEFINITIONS.slice(0, 4),
      controls: DEFINITIONS.slice(4),
    };
  }, []);

  const handleUpdate = (definition: SettingDefinition, value: any) => {
    setSaving(definition.key);
    setTimeout(() => {
      setSettings((current) => ({
        ...current,
        [definition.key]: {
          key: definition.key,
          value,
          updated_at: new Date().toISOString(),
          description: definition.description,
        },
      }));
      setSaving(null);
    }, 300);
  };

  return (
    <div className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Platform settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Fine-tune global preferences for the entire Kinjar network. Changes apply instantly for every family and admin.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <SettingsGroup
          title="Platform defaults"
          subtitle="Manage registration flows, uploads, and account limits."
          definitions={groupedSettings.platform}
          settings={settings}
          saving={saving}
          onUpdate={handleUpdate}
        />
        <SettingsGroup
          title="Communication & controls"
          subtitle="Edit support details and temporary maintenance notices."
          definitions={groupedSettings.controls}
          settings={settings}
          saving={saving}
          onUpdate={handleUpdate}
        />
      </section>
    </div>
  );
}

function SettingsGroup({
  title,
  subtitle,
  definitions,
  settings,
  saving,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  definitions: SettingDefinition[];
  settings: Record<string, GlobalSetting>;
  saving: string | null;
  onUpdate: (definition: SettingDefinition, value: any) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="space-y-4">
        {definitions.map((definition) => (
          <SettingRow
            key={definition.key}
            definition={definition}
            setting={settings[definition.key]}
            isSaving={saving === definition.key}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}

function SettingRow({
  definition,
  setting,
  isSaving,
  onUpdate,
}: {
  definition: SettingDefinition;
  setting?: GlobalSetting;
  isSaving: boolean;
  onUpdate: (definition: SettingDefinition, value: any) => void;
}) {
  const currentValue = setting?.value ?? definition.defaultValue;

  const renderInput = () => {
    switch (definition.type) {
      case 'boolean':
        return (
          <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={currentValue}
              onChange={(event) => onUpdate(definition, event.target.checked)}
              disabled={isSaving}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
            />
            {isSaving ? <span className="text-xs text-slate-400">Saving…</span> : null}
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(event) => onUpdate(definition, Number(event.target.value))}
            disabled={isSaving}
            className="w-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        );
      case 'email':
        return (
          <input
            type="email"
            value={currentValue}
            onChange={(event) => onUpdate(definition, event.target.value)}
            disabled={isSaving}
            className="w-64 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        );
      case 'text':
      default:
        return (
          <textarea
            value={currentValue}
            onChange={(event) => onUpdate(definition, event.target.value)}
            disabled={isSaving}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{definition.name}</p>
          <p className="text-xs text-slate-500">{definition.description}</p>
        </div>
        {renderInput()}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Updated {setting ? new Date(setting.updated_at).toLocaleString() : 'just now'}
      </p>
    </div>
  );
}
