import React from 'react';

type AuthInputProps = {
  bottomLabel?: string;
} & React.ComponentPropsWithRef<'input'>;

const AuthInput: React.FC<AuthInputProps> = (props) => {
  return (
    <div className="mb-5 w-full">
      <input
        className="w-full px-4 py-2 border border-solid border-primary2 rounded-md"
        {...props}
      />
      {!props.bottomLabel ? null : (
        <label className="label">
          <span className="label-text-alt error">{props.bottomLabel}</span>
        </label>
      )}
    </div>
  );
};

export { AuthInput };
