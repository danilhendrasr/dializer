type AuthSubmitBtnProps = {
  disabled: boolean;
  text: string;
};

const AuthSubmitBtn: React.FC<AuthSubmitBtnProps> = (props) => {
  const { disabled, text } = props;

  return (
    <input
      disabled={disabled}
      type="submit"
      value={text}
      className="my-2 py-2 w-full text-primary1 bg-accent1 rounded-md transition cursor-pointer disabled:bg-primary2 disabled:pointer-events-none active:scale-95"
    />
  );
};

export { AuthSubmitBtn };
