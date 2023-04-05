type AuthSubmitBtnProps = {
  disabled: boolean;
  text: string;
};

const AuthSubmitBtn: React.FC<AuthSubmitBtnProps> = (props) => {
  const { disabled, text } = props;

  let className =
    'my-2 py-2 w-full text-white bg-primary rounded-md transition cursor-pointer active:scale-95';

  if (disabled) {
    className =
      'my-2 py-2 w-full bg-base-300 pointer-events-none text-gray-400 rounded-md transition scale-95';
  }

  return (
    <input
      disabled={disabled}
      type="submit"
      value={text}
      className={className}
    />
  );
};

export { AuthSubmitBtn };
