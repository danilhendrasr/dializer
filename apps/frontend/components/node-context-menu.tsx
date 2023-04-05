import React, { PropsWithChildren } from 'react';
import { WorkbenchModal } from './workbench-modal';

type Props = PropsWithChildren<{
  x: number;
  y: number;
  onClose: () => void;
}>;

export const ContextMenu: React.FC<Props> = (props) => {
  const { x, y, children, onClose } = props;

  return (
    <WorkbenchModal
      className="w-28"
      x={x}
      y={y}
      title="Actions"
      onClose={onClose}
    >
      {children}
    </WorkbenchModal>
  );
};
