import { MotionProps, motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

type ControlPanelProps = PropsWithChildren<MotionProps>;

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const { children, ...motionProps } = props;

  return (
    <motion.div
      className="absolute flex top-4 left-1/2 translate-x-1/2 shadow-md px-5 py-2 gap-2 z-50 bg-base-100"
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
