import React from 'react';
import { MotionProps, motion } from 'framer-motion';

type AuthInputProps = {
  bottomLabel?: string;
  motionProps?: MotionProps;
} & React.ComponentPropsWithRef<'input'>;

const AuthInput: React.FC<AuthInputProps> = (props) => {
  return (
    <motion.div className="mb-5 w-full" {...props.motionProps}>
      <input
        className="w-full px-4 py-2 border border-solid border-primary2 rounded-md"
        {...props}
      />
      {!props.bottomLabel ? null : (
        <label className="label">
          <span className="label-text-alt error">{props.bottomLabel}</span>
        </label>
      )}
    </motion.div>
  );
};

export { AuthInput };
