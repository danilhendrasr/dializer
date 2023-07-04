import React from 'react';

type Props = {
  x: number;
  y: number;
  text: string;
  show: boolean;
  onClose: () => void;
};

/**
 * Modal used to input programmatic expressions.
 * Primarily used to input expressions for the flowchart nodes' content.
 */
export const OutputModal: React.FC<Props> = (props) => {
  const { text, show, onClose } = props;

  return (
    <>
      <input
        type="checkbox"
        id="my-modal-4"
        className="modal-toggle"
        checked={show}
      />
      <label
        htmlFor="my-modal-4"
        className="modal cursor-pointer"
        onClick={onClose}
      >
        <label className="modal-box relative" htmlFor="">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Output</h3>
            <span className="btn btn-circle" onClick={onClose}>
              X
            </span>
          </div>
          <p className="py-4">{text}</p>
        </label>
      </label>
    </>
  );
};
