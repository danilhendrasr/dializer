import React, { useState } from 'react';
import { WorkbenchModal } from './workbench-modal';

type Props = {
  x: number;
  y: number;
  callerIdx: number;
  onClose: () => void;
};

/**
 * Modal used to input programmatic expressions.
 * Primarily used to input expressions for the flowchart nodes' content.
 */
export const ExpressionModal: React.FC<Props> = (props) => {
  const { x, y } = props;

  const [textAreaVal, setTextAreaVal] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Code processed');
  };

  return (
    <WorkbenchModal
      x={x}
      y={y}
      onClose={props.onClose}
      title="Input Expressions"
    >
      <form className="p-2" onSubmit={onSubmit}>
        <textarea
          className="w-full h-32 px-3 py-2 font-sans text-sm border border-base-200"
          id="expression-textarea"
          placeholder="testing = 3"
          value={textAreaVal}
          onChange={(e) => setTextAreaVal(e.target.value)}
        ></textarea>
        <input
          className="btn btn-primary btn-sm mt-2"
          type="submit"
          value="Save"
        />
      </form>
    </WorkbenchModal>
  );
};
