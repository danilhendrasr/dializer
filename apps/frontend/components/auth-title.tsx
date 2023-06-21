import { motion, MotionProps } from 'framer-motion';
import { PropsWithChildren } from 'react';

const AuthTitle: React.FC<PropsWithChildren<MotionProps>> = (props) => {
  const { children, ...motionProps } = props;

  return (
    <motion.h1
      className="text-4xl text-center font-bold tracking-wider font-sans m-5 text-accent2"
      {...motionProps}
    >
      {children}
    </motion.h1>
  );
};

export { AuthTitle };
