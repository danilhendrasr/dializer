import { NodeTypes } from '@dializer/types';
import Image from 'next/image';
import { WorkbenchModal } from './workbench-modal';

type NewNodeModalProps = {
  onSelect: (nodeType: NodeTypes) => void;
  onClose: () => void;
  x: number;
  y: number;
};

export const NewNodeModal: React.FC<NewNodeModalProps> = (props) => {
  const { x, y, onSelect, onClose } = props;

  return (
    <WorkbenchModal
      x={x}
      y={y}
      title="Add new node"
      onClose={onClose}
      className="w-fit max-w-[200px]"
    >
      <div className="w-full flex flex-row flex-wrap gap-4 items-center justify-center">
        <Image
          className="cursor-pointer hover:bg-base-200 p-2"
          src="/process-node.svg"
          alt=""
          width={70}
          height={60}
          onClick={() => onSelect(NodeTypes.PROCESS)}
        />
        <Image
          className="cursor-pointer hover:bg-base-200 p-2"
          src="/input-node.svg"
          alt=""
          width={85}
          height={60}
          onClick={() => onSelect(NodeTypes.INPUT)}
        />
        <Image
          className="cursor-pointer hover:bg-base-200 p-2"
          src="/output-node.svg"
          alt=""
          width={90}
          height={60}
          onClick={() => onSelect(NodeTypes.OUTPUT)}
        />
        <Image
          className="cursor-pointer hover:bg-base-200 p-2"
          src="/if-node.svg"
          alt=""
          width={55}
          height={60}
          onClick={() => onSelect(NodeTypes.IF)}
        />
      </div>
    </WorkbenchModal>
  );
};
