import React, { useState } from 'react';
import { WorkbenchModal } from './workbench-modal';

type Props = {
  x: number;
  y: number;
  onClose: () => void;
  onSave: (variableName: string) => void;
};

/**
 * Modal used to get the variable name to save the input to.
 */
export const InputModal: React.FC<Props> = (props) => {
  const { x, y, onClose, onSave } = props;

  const [variableName, setVariableName] = useState('');

  return (
    <WorkbenchModal
      className="w-32"
      x={x}
      y={y}
      onClose={onClose}
      title="Variable to Save the Input To"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(variableName);
        }}
        className="flex flex-col"
      >
        <input
          className="input input-md input-bordered mb-1 "
          type="text"
          placeholder="testing"
          value={variableName}
          onChange={(e) => setVariableName(e.target.value)}
        />
        <input
          disabled={variableName === ''}
          className="btn btn-primary btn-sm mt-2 w-fit"
          type="submit"
          value="Save"
        />
      </form>
    </WorkbenchModal>
  );
};
