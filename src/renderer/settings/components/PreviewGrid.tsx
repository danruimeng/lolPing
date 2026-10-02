import { Button } from '@fluentui/react-components';
import { ALL_PINGS, textureUrl } from '../../../shared/pings';
import { api } from '../api';

export function PreviewGrid() {
  return (
    <div className="previews">
      {ALL_PINGS.map((p) => (
        <Button key={p.id} className="previewBtn" appearance="secondary" onClick={() => void api.previewPing(p.id)}>
          <img src={textureUrl(p.icon)} alt="" />
          {p.name}
        </Button>
      ))}
    </div>
  );
}
