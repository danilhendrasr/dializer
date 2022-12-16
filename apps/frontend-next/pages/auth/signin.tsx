import { FormEventHandler, useRef } from 'react';
import Router from 'next/router';
import { LocalStorageItems } from '../../common/types';

export default function SignInPage() {
  const usernameRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();
  const handleSignIn: FormEventHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3333/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: usernameRef.current.value,
          password: passwordRef.current.value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const jsonResponse = await response.json();
      if (!response.ok) throw new Error(jsonResponse);

      localStorage.setItem(
        LocalStorageItems.ACCESS_TOKEN,
        jsonResponse.access_token
      );
      Router.replace('/workspaces');
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignIn}>
        <input ref={usernameRef} type="text" name="username" id="username" />
        <input
          ref={passwordRef}
          type="password"
          name="password"
          id="password"
        />
        <input type="submit" value="Sign in" />
      </form>
    </div>
  );
}
