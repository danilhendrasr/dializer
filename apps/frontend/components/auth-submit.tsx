type AuthSubmitBtnProps = {
  disabled: boolean;
  text: string;
  isSubmitting: boolean;
};

const AuthSubmitBtn: React.FC<AuthSubmitBtnProps> = (props) => {
  const { disabled, text, isSubmitting } = props;

  let className =
    'btn btn-primary my-2 py-2 w-full transition cursor-pointer active:scale-95';

  if (isSubmitting) {
    className =
      'btn my-2 py-2 w-full bg-base-300 pointer-events-none text-gray-400 transition scale-95 loading';
  } else if (disabled) {
    className =
      'btn my-2 py-2 w-full bg-base-300 pointer-events-none text-gray-400 transition scale-95';
  }

  return (
    <button disabled={disabled} value={text} className={className}>
      {text}
    </button>
  );
};

export { AuthSubmitBtn };
