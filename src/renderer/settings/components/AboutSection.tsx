import { Button } from '@fluentui/react-components';
import { useEffect, useState, type ReactNode } from 'react';
import type { About } from '../../../shared/ipc';
import { api } from '../api';
import { SettingRow } from './rows';

export function AboutSection({ icon }: { icon: ReactNode }) {
  const [about, setAbout] = useState<About | null>(null);
  useEffect(() => {
    void api.getAbout().then(setAbout);
  }, []);
  if (!about) return null;
  return (
    <>
      <SettingRow icon={icon} title="About" description={`lolPing ${about.version} · Ping icons and sounds © Riot Games`}>
        <Button onClick={() => void api.openProjectPage()}>GitHub page</Button>
        <Button onClick={() => void api.openSettingsFolder()}>Open settings folder</Button>
      </SettingRow>
      {about.problems.length > 0 ? (
        <div className="card notes">
          <div className="lbl">
            <b>Problems</b>
            {about.problems.map((p) => <span key={p} className="desc">• {p}</span>)}
          </div>
        </div>
      ) : null}
      <div className="card notes">
        <div className="lbl">
          <b>Known limitations</b>
          {about.limitations.map((l) => <span key={l} className="desc">• {l}</span>)}
        </div>
      </div>
    </>
  );
}
