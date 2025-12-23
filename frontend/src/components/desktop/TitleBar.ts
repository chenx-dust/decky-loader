import { Export, findModuleExport } from '@decky/ui';
import { CSSProperties, FC, ReactNode } from 'react';

export interface TitleBarProps {
  className?: string;
  style?: CSSProperties;
  hideActions?: boolean;
  hideClose?: boolean;
  hideMin?: boolean;
  hideMax?: boolean;
  bOSX?: boolean;
  bForceWindowFocused?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  extraActions?: ReactNode;
  popup?: Window;
  children?: ReactNode;
}

export const TitleBar: FC<TitleBarProps> = findModuleExport((e: Export) => {
  return typeof e === 'function' && e.toString().includes('TitleBar') && e.toString().includes('title-area');
});
