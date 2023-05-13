import React from 'react';

type AuthInputProps = React.ComponentPropsWithRef<'input'>;

const AuthInput: React.FC<AuthInputProps> = (props) => {
  return (
    <input
      className="px-4 py-2 mb-5 border border-solid border-primary2 rounded-md"
      {...props}
    />
  );
};

export { AuthInput };
