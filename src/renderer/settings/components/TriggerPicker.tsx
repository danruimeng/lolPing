import { Dropdown, Option, OptionGroup } from '@fluentui/react-components';
import { useState } from 'react';
import { UNSAFE_TRIGGER_VKS, vkLabel } from '../../../shared/keys';
import { triggerLabel, type NamedTrigger, type TriggerKey } from '../../../shared/settings';
import { useText } from '../text';
import { KeyCapture } from './KeyCapture';

const KEYBOARD: NamedTrigger[] = ['alt', 'ctrl', 'shift', 'win', 'capslock'];

/** Fluent Dropdown (never a native <select>) with Keyboard / Mouse groups and a custom key option. */
export function TriggerPicker({ value, onChange }: { value: TriggerKey; onChange(t: TriggerKey): void }) {
  const t = useText();
  const isCustom = typeof value === 'object';
  const [choosingCustom, setChoosingCustom] = useState(false);
  const showCustom = isCustom || choosingCustom;
  const selected = showCustom ? 'custom' : (value as NamedTrigger);

  return (
    <>
      {showCustom ? (
        <KeyCapture
          key={choosingCustom ? 'choosing' : 'idle'}
          parts={isCustom ? [vkLabel(value.vk)] : [t.chooseKey]}
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
        value={showCustom ? t.customKey : triggerLabel(value, t.lang)}
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
        <OptionGroup label={t.keyboard}>
          {KEYBOARD.map((k) => (
            <Option key={k} value={k}>{triggerLabel(k)}</Option>
          ))}
        </OptionGroup>
        <OptionGroup label={t.mouse}>
          <Option value="mouse4" text={t.mouse4}>{t.mouse4}<span className="desc inline">{t.mouseBack}</span></Option>
          <Option value="mouse5" text={t.mouse5}>{t.mouse5}<span className="desc inline">{t.mouseForward}</span></Option>
        </OptionGroup>
        <Option value="custom" text={t.customKeyMenu}>{t.customKeyMenu}</Option>
      </Dropdown>
    </>
  );
}
