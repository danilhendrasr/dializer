import React, { useContext, useState } from 'react';
import { WorkbenchModal } from './workbench-modal';
import { InterpreterContext } from '../contexts/expression-interpreter.context';

type Props = {
  x: number;
  y: number;
  // Supply this props if node already has a text
  initialValue?: string;
  onClose: () => void;
  onSubmit: (expression: string) => void;
};

/**
 * Modal used to input programmatic expressions.
 * Primarily used to input expressions for the flowchart nodes' content.
 */
export const ExpressionModal: React.FC<Props> = (props) => {
  const { x, y, initialValue, onClose, onSubmit } = props;

  const interpreter = useContext(InterpreterContext);
  const [expression, setExpression] = useState(initialValue ?? '');
  const [err, setErr] = useState(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      interpreter.parse(expression);
      onSubmit(expression);
    } catch (e) {
      const err = (e as Error).message;
      setErr(err);
    }
  };

  return (
    <WorkbenchModal x={x} y={y} onClose={onClose} title="Input Expressions">
      <form className="p-2" onSubmit={handleSubmit}>
        <textarea
          className="w-full h-14 px-3 py-2 font-sans text-sm border border-base-200"
          id="expression-textarea"
          placeholder="testing = 3"
          value={expression}
          onChange={(e) => {
            if (err) setErr(null);
            setExpression(e.target.value);
          }}
        ></textarea>
        <p className="text-red-400 text-xs my-1">{err}</p>
        <input
          className="btn btn-primary btn-sm mt-2"
          type="submit"
          value="Save"
          disabled={expression === '' || err}
        />
      </form>
    </WorkbenchModal>
  );
};
