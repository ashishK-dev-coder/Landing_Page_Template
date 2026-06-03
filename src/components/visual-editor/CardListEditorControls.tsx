"use client";

type Props = {
  saving: boolean;
  addLabel: string;
  onAdd: () => void;
  className?: string;
};

export function CardListEditorBar({ saving, addLabel, onAdd, className = "" }: Props) {
  return (
    <div className={`card-list-editor-bar ${className}`.trim()}>
      <button type="button" className="card-list-editor-add" disabled={saving} onClick={onAdd}>
        {saving ? "Saving..." : addLabel}
      </button>
    </div>
  );
}

type RemoveProps = {
  label?: string;
  disabled?: boolean;
  onRemove: () => void;
};

export function CardRemoveButton({ label = "Remove", disabled, onRemove }: RemoveProps) {
  return (
    <button
      type="button"
      className="card-list-editor-remove"
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      {label}
    </button>
  );
}
