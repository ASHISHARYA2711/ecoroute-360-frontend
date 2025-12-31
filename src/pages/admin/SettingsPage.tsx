import { useEffect, useState } from 'react';
import { SettingsService } from '../../api/settings.service';
import type { SystemSettings } from '../../api/settings.service';

const SettingsPage = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    SettingsService.getSettings()
      .then(setSettings)
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    key: keyof SystemSettings,
    value: number | boolean
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await SettingsService.updateSettings(settings);
      setSuccess('Settings updated successfully');
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading settings...</p>;
  if (error && !settings) return <p style={{ color: 'red' }}>{error}</p>;
  if (!settings) return null;

  return (
    <div>
      <h1>System Settings</h1>
      <p style={{ color: '#64748b' }}>
        Configure thresholds and route behavior
      </p>

      <div style={card}>
        <h3>Waste Thresholds</h3>

        <label style={label}>
          Pre-alert threshold (%)
          <input
            type="number"
            value={settings.preAlertThreshold}
            onChange={(e) =>
              handleChange('preAlertThreshold', Number(e.target.value))
            }
            style={input}
          />
        </label>

        <label style={label}>
          Critical threshold (%)
          <input
            type="number"
            value={settings.criticalThreshold}
            onChange={(e) =>
              handleChange('criticalThreshold', Number(e.target.value))
            }
            style={input}
          />
        </label>
      </div>

      <div style={card}>
        <h3>Route Optimization</h3>

        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.autoRouteGeneration}
            onChange={(e) =>
              handleChange('autoRouteGeneration', e.target.checked)
            }
          />
          Enable automatic route generation
        </label>

        <label style={label}>
          Max bins per route
          <input
            type="number"
            value={settings.maxBinsPerRoute}
            onChange={(e) =>
              handleChange('maxBinsPerRoute', Number(e.target.value))
            }
            style={input}
          />
        </label>
      </div>

      <div style={card}>
        <h3>System Refresh</h3>

        <label style={label}>
          Refresh interval (minutes)
          <input
            type="number"
            value={settings.refreshIntervalMinutes}
            onChange={(e) =>
              handleChange('refreshIntervalMinutes', Number(e.target.value))
            }
            style={input}
          />
        </label>
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        style={{
          marginTop: 20,
          padding: '12px 18px',
          borderRadius: 8,
          border: 'none',
          background: '#2563eb',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      {success && <p style={{ color: '#16a34a' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 10,
  marginTop: 20,
};

const label = {
  display: 'block',
  marginTop: 12,
  fontSize: 14,
};

const checkboxLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 12,
  fontSize: 14,
};

const input = {
  display: 'block',
  marginTop: 6,
  padding: '8px',
  width: '100%',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
};

export default SettingsPage;
