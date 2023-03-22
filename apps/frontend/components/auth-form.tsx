type Props = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
};

const AuthForm: React.FC<Props> = (props) => {
  const { onSubmit, children } = props;

  return (
    <form
      className="flex flex-col p-10 border-solid shadow-lg rounded-md"
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};

export { AuthForm };
