import { MotionProps, motion } from 'framer-motion';

type Props = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
} & MotionProps;

const AuthForm: React.FC<Props> = (props) => {
  const { onSubmit, children, ...motionProps } = props;

  return (
    <motion.form
      className="flex flex-col p-10 border-solid shadow-lg rounded-md bg-white"
      onSubmit={onSubmit}
      {...motionProps}
    >
      {children}
    </motion.form>
  );
};

export { AuthForm };
