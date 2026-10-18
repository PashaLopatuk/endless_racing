import { ExpandIcon } from "./icons";

interface Props {
  onOpen: () => void;
}

export const ExpandLevelSelectHint = ({ onOpen }: Props) => (
  <button
    type="button"
    className="expand-level-select-hint"
    onClick={onOpen}
  >
    <span className="expand-level-select-hint__pill">
      <ExpandIcon className="expand-level-select-hint__icon" />
      EXPAND LEVEL SELECTOR
    </span>
  </button>
);
