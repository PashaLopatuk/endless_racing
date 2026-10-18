import type { ReactNode } from "react";

interface Props {
  ariaLabel: string;
  onClick?: () => void;
  variant?: "square" | "circle";
  children: ReactNode;
}

export const GlassIconButton = ({
  ariaLabel,
  onClick,
  variant = "square",
  children,
}: Props) => (
  <button
    type="button"
    className={`glass-icon-button glass-icon-button--${variant}`}
    aria-label={ariaLabel}
    onClick={onClick}
  >
    {children}
  </button>
);
