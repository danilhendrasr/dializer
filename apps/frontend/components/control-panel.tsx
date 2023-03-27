import { PropsWithChildren } from 'react';

export const ControlPanel: React.FC<PropsWithChildren> = (props) => {
  return (
    <div className="absolute flex top-4 left-1/2 translate-x-1/2 shadow-md px-5 py-2 gap-2 z-50 bg-base-100">
      {props.children}
    </div>
  );
};
