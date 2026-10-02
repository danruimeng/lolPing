import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import {
  ArrowMove24Regular, CursorClick24Regular, Info24Regular, Keyboard24Regular, MusicNote224Regular, Play24Regular,
  Power24Regular, ResizeLarge24Regular, Rocket24Regular, Settings24Regular, Speaker224Regular, SpeakerMute24Regular,
  Timer24Regular, Cursor24Regular,
} from '@fluentui/react-icons';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { AppStatus } from '../../shared/ipc';
import { hotkeyParts } from '../../shared/keys';
import { textureUrl } from '../../shared/pings';
import { triggerLabel, type Settings } from '../../shared/settings';
import { AboutSection } from './components/AboutSection';
import { KeyCapture } from './components/KeyCapture';
import { PreviewGrid } from './components/PreviewGrid';
import { SettingRow, SliderRow, SwitchRow } from './components/rows';
import { StatusCard } from './components/StatusCard';
import { TriggerPicker } from './components/TriggerPicker';
import { useAppState, type Update } from './useAppState';

const SECTIONS: { id: string; label: string; icon: ReactNode }[] = [
  { id: 'trigger', label: 'Trigger', icon: <Cursor24Regular /> },
  { id: 'toggle', label: 'Toggle', icon: <Keyboard24Regular /> },
  { id: 'pings', label: 'Pings & sound', icon: <Speaker224Regular /> },
  { id: 'preview', label: 'Preview', icon: <Play24Regular /> },
  { id: 'app', label: 'App', icon: <Settings24Regular /> },
];

function useDarkMode(): boolean {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const m = matchMedia(query);
    const onChange = () => setDark(m.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);
  return dark;
}

export function App() {
  const dark = useDarkMode();
  const { settings, status, update } = useAppState();
  return (
    <FluentProvider theme={dark ? webDarkTheme : webLightTheme} style={{ background: 'transparent', height: '100%' }}>
      {settings && status ? <SettingsPage settings={settings} status={status} update={update} /> : null}
    </FluentProvider>
  );
}

function SettingsPage({ settings: s, status, update }: { settings: Settings; status: AppStatus; update: Update }) {
  const mainRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(SECTIONS[0].id);
  const off = !status.enabled || status.helper === 'failed';
  const trigger = triggerLabel(s.trigger);
  const [hotkeyError, setHotkeyError] = useState<string | null>(null);
  const mouseTrigger = s.trigger === 'mouse4' || s.trigger === 'mouse5';
  const customTrigger = typeof s.trigger === 'object';

  const onScroll = () => {
    const main = mainRef.current;
    if (!main) return;
    let current = SECTIONS[0].id;
    for (const sec of SECTIONS) {
      const el = document.getElementById(sec.id);
      if (el && el.offsetTop - main.offsetTop - 40 <= main.scrollTop) current = sec.id;
    }
    setActive(current);
  };

  return (
    <div className="app">
      <div className="titlebar">
        <img src={textureUrl('generic_ping')} alt="" />
        lolPing
      </div>
      <nav className="side">
        <div className="brand">
          <img src={textureUrl('pingwheel_basicpingrender')} alt="" />
          <div>
            <b>lolPing</b>
            <span className="desc">Ping anywhere</span>
          </div>
        </div>
        {SECTIONS.map((sec) => (
          <button key={sec.id} className={`navItem${active === sec.id ? ' sel' : ''}`} onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })}>
            {sec.icon}
            {sec.label}
          </button>
        ))}
      </nav>
      <main className="content" ref={mainRef} onScroll={onScroll}>
        <h1 className="pageTitle">Settings</h1>
        <StatusCard settings={s} status={status} />

        <div className="section" id="trigger">Trigger</div>
        <SettingRow icon={<Cursor24Regular />} title="Trigger key" dim={off}
          description={(
            <>
              {mouseTrigger ? 'Press and drag with this mouse button to open the wheel' : 'Hold this, then drag with the left mouse button to open the wheel'}
              {customTrigger ? <span className="desc">This key won’t type in other apps while lolPing is on</span> : null}
            </>
          )}>
          <TriggerPicker value={s.trigger} onChange={(t) => void update({ trigger: t })} />
        </SettingRow>
        <SliderRow limit="dragThresholdPx" icon={<ArrowMove24Regular />} title="Drag distance" description="How far the mouse must move before the wheel opens"
          value={s.dragThresholdPx} format={(v) => `${v} px`} onChange={(v) => void update({ dragThresholdPx: v })} dim={off} />
        <SwitchRow icon={<CursorClick24Regular />} title={`${trigger} + click places a generic ping`}
          description={`When off, ${trigger} + click passes straight through to the app underneath`}
          checked={s.clickPing} onChange={(v) => void update({ clickPing: v })} dim={off} />

        <div className="section" id="toggle">Toggle</div>
        <SettingRow icon={<Keyboard24Regular />} title="Enable / disable shortcut" description="Works anywhere, even while pinging is off">
          <KeyCapture
            parts={hotkeyParts(s.toggleHotkey)}
            requireModifier
            error={hotkeyError}
            onCapture={async (c) => {
              const result = await update({ toggleHotkey: c });
              setHotkeyError(result.ok ? null : result.error);
            }}
          />
        </SettingRow>
        <SwitchRow icon={<Power24Regular />} title="Start enabled" description="Pinging is on when lolPing launches"
          checked={s.enabledOnStart} onChange={(v) => void update({ enabledOnStart: v })} />

        <div className="section" id="pings">Pings &amp; sound</div>
        <SliderRow limit="pingSizePx" icon={<ResizeLarge24Regular />} title="Ping size" value={s.pingSizePx}
          format={(v) => `${v} px`} onChange={(v) => void update({ pingSizePx: v })} />
        <SliderRow limit="pingDurationS" icon={<Timer24Regular />} title="Ping duration" description="How long a ping stays on screen"
          value={s.pingDurationS} format={(v) => `${v.toFixed(1)} s`} onChange={(v) => void update({ pingDurationS: v })} />
        <SliderRow limit="volume" icon={<Speaker224Regular />} title="Volume" value={s.volume}
          format={(v) => `${v}`} onChange={(v) => void update({ volume: v })} dim={s.muted} />
        <SwitchRow icon={<SpeakerMute24Regular />} title="Mute ping sounds" checked={s.muted} onChange={(v) => void update({ muted: v })} />
        <SwitchRow icon={<MusicNote224Regular />} title="Wheel tick sound" description="Plays a quiet click when hovering a new slice"
          checked={s.tickSound} onChange={(v) => void update({ tickSound: v })} />

        <div className="section" id="preview">Preview</div>
        <PreviewGrid />

        <div className="section" id="app">App</div>
        <SwitchRow icon={<Rocket24Regular />} title="Launch at Windows startup" description="Starts hidden in the tray"
          checked={s.launchAtStartup} onChange={(v) => void update({ launchAtStartup: v })} />
        <AboutSection icon={<Info24Regular />} />
      </main>
    </div>
  );
}
