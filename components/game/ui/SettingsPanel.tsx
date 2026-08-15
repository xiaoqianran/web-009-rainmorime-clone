// ============================================================
// SettingsPanel — Audio, display, and system settings
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import styles from '../../../styles/Game.module.scss';
import { UI } from '../../../data/game/strings';

export interface GameSettings {
  sfxVolume: number;
  musicVolume: number;
  textSpeed: number;
  autoSave: boolean;
  showTrust: boolean;
  screenShake: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  sfxVolume: 80,
  musicVolume: 60,
  textSpeed: 40,
  autoSave: true,
  showTrust: false,
  screenShake: true,
};

const STORAGE_KEY = 'rainmorime_settings';

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: GameSettings): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  return (
    <div className={styles.settingsRoot}>
      <div className={styles.settingsBg} onClick={onClose} />
      <div className={styles.settingsPanel}>
        <div className={styles.settingsHeader}>
          <span>{UI.settings.header}</span>
          <button className={styles.settingsClose} onClick={onClose}>×</button>
        </div>

        <div className={styles.settingsBody}>
          <div className={styles.settingsSection}>
            <div className={styles.settingsSectionLabel}>{UI.settings.audio}</div>

            <SliderRow
              label={UI.settings.sfx}
              value={settings.sfxVolume}
              onChange={(v) => update('sfxVolume', v)}
            />
            <SliderRow
              label={UI.settings.bgm}
              value={settings.musicVolume}
              onChange={(v) => update('musicVolume', v)}
            />
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.settingsSectionLabel}>{UI.settings.display}</div>

            <SliderRow
              label={UI.settings.textSpeed}
              value={settings.textSpeed}
              onChange={(v) => update('textSpeed', v)}
              min={10}
              max={80}
            />
            <ToggleRow
              label={UI.settings.screenShake}
              value={settings.screenShake}
              onChange={(v) => update('screenShake', v)}
            />
            <ToggleRow
              label={UI.settings.showTrust}
              value={settings.showTrust}
              onChange={(v) => update('showTrust', v)}
            />
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.settingsSectionLabel}>{UI.settings.system}</div>

            <ToggleRow
              label={UI.settings.autoSave}
              value={settings.autoSave}
              onChange={(v) => update('autoSave', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange, min = 0, max = 100 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className={styles.settingsRow}>
      <span className={styles.settingsLabel}>{label}</span>
      <div className={styles.sliderWrap}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.sliderValue}>{value}</span>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className={styles.settingsRow}>
      <span className={styles.settingsLabel}>{label}</span>
      <button
        className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
        onClick={() => onChange(!value)}
      >
        <span className={styles.toggleKnob} />
        <span className={styles.toggleText}>{value ? UI.settings.on : UI.settings.off}</span>
      </button>
    </div>
  );
}
