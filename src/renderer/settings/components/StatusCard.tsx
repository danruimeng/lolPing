import { Button, Switch } from '@fluentui/react-components';
import type { AppStatus } from '../../../shared/ipc';
import { hotkeyLabel } from '../../../shared/keys';
import { triggerLabel, type Settings } from '../../../shared/settings';
import { api } from '../api';

export function StatusCard({ settings, status }: { settings: Settings; status: AppStatus }) {
  const failed = status.helper === 'failed';
  const title = failed ? 'Input helper stopped' : status.enabled ? 'Pinging is on' : 'Pinging is off';
  const hint = failed
    ? 'Mouse and keyboard input can’t be read right now.'
    : `Hold ${triggerLabel(settings.trigger)} and drag to open the ping wheel · ${hotkeyLabel(settings.toggleHotkey)} to turn ${status.enabled ? 'off' : 'on'}`;
  return (
    <div className="card status">
      <div className={`dot${failed ? ' failed' : status.enabled ? '' : ' off'}`} />
      <div className="lbl">
        <b style={{ fontSize: 16 }}>{title}</b>
        <span className="desc">{hint}</span>
      </div>
      <div className="ctl">
        {failed ? (
          <Button appearance="primary" onClick={() => void api.retryHelper()}>Restart helper</Button>
        ) : (
          <Switch checked={status.enabled} onChange={(_, d) => void api.setEnabled(d.checked)} label={status.enabled ? 'On' : 'Off'} labelPosition="before" />
        )}
      </div>
    </div>
  );
}
