import { Dropdown, Option, OptionGroup } from '@fluentui/react-components';
import { useState } from 'react';
import { UNSAFE_TRIGGER_VKS, vkLabel } from '../../../shared/keys';
import { triggerLabel, type NamedTrigger, type TriggerKey } from '../../../shared/settings';
import { KeyCapture } from './KeyCapture';

const KEYBOARD: NamedTrigger[] = ['alt', 'ctrl', 'shift', 'win', 'capslock'];

/** Fluent Dropdown (never a native <select>) with Keyboard / Mouse groups and a custom key option. */
export function TriggerPicker({ value, onChange }: { value: TriggerKey; onChange(t: TriggerKey): void }) {
  const isCustom = typeof value === 'object';
  const [choosingCustom, setChoosingCustom] = useState(false);
  const showCustom = isCustom || choosingCustom;
  const selected = showCustom ? 'custom' : (value as NamedTrigger);

  return (
    <>
      {showCustom ? (
        <KeyCapture
          key={choosingCustom ? 'choosing' : 'idle'}
          parts={isCustom ? [vkLabel(value.vk)] : ['Choose a key']}
          requireModifier={false}
          forbiddenVks={UNSAFE_TRIGGER_VKS}
          autoListen={choosingCustom}
          onCancel={() => setChoosingCustom(false)}
          onCapture={(c) => {
            setChoosingCustom(false);
            onChange({ vk: c.vk });
          }}
        />
      ) : null}
      <Dropdown
        style={{ minWidth: 170 }}
        value={showCustom ? 'Custom key' : triggerLabel(value)}
        selectedOptions={[selected]}
        onOptionSelect={(_, d) => {
          if (d.optionValue === 'custom') {
            setChoosingCustom(true);
          } else if (d.optionValue) {
            setChoosingCustom(false);
            onChange(d.optionValue as NamedTrigger);
          }
        }}
      >
        <OptionGroup label="Keyboard">
          {KEYBOARD.map((t) => (
            <Option key={t} value={t}>{triggerLabel(t)}</Option>
          ))}
        </OptionGroup>
        <OptionGroup label="Mouse">
          <Option value="mouse4" text="Mouse 4">Mouse 4<span className="desc inline">back</span></Option>
          <Option value="mouse5" text="Mouse 5">Mouse 5<span className="desc inline">forward</span></Option>
        </OptionGroup>
        <Option value="custom" text="Custom key…">Custom key…</Option>
      </Dropdown>
    </>
  );
}
