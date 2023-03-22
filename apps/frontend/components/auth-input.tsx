import { ChangeEventHandler } from 'react';

type AuthInputProps = {
  type?: 'text' | 'password';
  id?: string;
  placeholder?: string;
  name?: string;
  value: string;
  onChangeHandler: ChangeEventHandler<HTMLInputElement>;
};

const AuthInput: React.FC<AuthInputProps> = (props) => {
  const {
    type = 'text',
    id,
    placeholder,
    name,
    value,
    onChangeHandler,
  } = props;

  return (
    <input
      type={type}
      value={value}
      onChange={onChangeHandler}
      name={name}
      id={id}
      placeholder={placeholder}
      className="px-4 py-2 mb-5 border border-solid border-primary2 rounded-md"
    />
  );
};

export { AuthInput };
