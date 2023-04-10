import React from 'react';
import { WorkbenchModal } from './workbench-modal';

type Props = {
  x: number;
  y: number;
  text: string;
  onClose: () => void;
};

/**
 * Modal used to input programmatic expressions.
 * Primarily used to input expressions for the flowchart nodes' content.
 */
export const OutputModal: React.FC<Props> = (props) => {
  const { x, y, text, onClose } = props;

  return (
    <WorkbenchModal
      className="w-32"
      x={x}
      y={y}
      onClose={onClose}
      title="Output"
    >
      <p className="text-xs my-1">{text}</p>
      <input
        className="btn btn-primary btn-sm mt-2"
        type="submit"
        value="OK"
        onClick={onClose}
      />
    </WorkbenchModal>
  );
};
