import { PropsWithChildren } from 'react';
import Draggable from 'react-draggable';
import { X } from 'tabler-icons-react';

type Props = PropsWithChildren<{
  title: string;
  x: number;
  y: number;
  className?: string;
  onClose: () => void;
}>;

/**
 * Reusable modal container for the workbench page.
 */
export const WorkbenchModal: React.FC<Props> = (props) => {
  const { title, x, y, children, className: classNames, onClose } = props;

  return (
    <Draggable handle="#header">
      <div
        className={`absolute w-72 h-fit bg-base-100 shadow-md ` + classNames}
        // Left and top is not set in the className because it seems in tailwind we
        // cannot use string interpolation (e.g. left-[${x}px] or top-[${y}px]).
        style={{ left: x, top: y }}
      >
        {/* Panel's top section */}
        <div
          className="px-3 py-1 flex items-center justify-between border-b border-base-200 cursor-grab active:cursor-grabbing"
          id="header"
        >
          <p className="text-sm">{title}</p>
          <X
            className="hover:bg-base-200 cursor-pointer"
            size={17}
            onClick={onClose}
          />
        </div>
        {/* End of panel's top section */}

        <div className="px-3 py-2 flex flex-col">{children}</div>
      </div>
    </Draggable>
  );
};
