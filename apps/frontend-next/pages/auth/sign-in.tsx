import { FormEventHandler, useState } from 'react';
import Router from 'next/router';
import { LocalStorageItems } from '../../common/types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import { AuthForm } from '../../components/auth-form';
import { AuthInput } from '../../components/auth-input';
import { AuthTitle } from '../../components/auth-title';
import { AuthSubmitBtn } from '../../components/auth-submit';
import { useAuthorizedProtection } from '../../hooks/use-authorized-protection.hook';
import Link from 'next/link';

export default function SignInPage() {
  useAuthorizedProtection();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast('Please provide complete credentials', { type: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
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
      toast(error, { type: 'error' });
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Dializer</title>
      </Head>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AuthTitle>Sign In</AuthTitle>
        <AuthForm onSubmit={handleSignIn}>
          <AuthInput
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChangeHandler={(e) => setUsername(e.target.value)}
          />
          <AuthInput
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChangeHandler={(e) => setPassword(e.target.value)}
          />
          <AuthSubmitBtn disabled={!username || !password} text="Sign in" />
        </AuthForm>
        <p className="text-sm text-center my-5 text-accent2">
          Or register{' '}
          <Link
            href="/auth/sign-up"
            className="text-accent1 underline hover:no-underline hover:text-secondary"
          >
            here
          </Link>
          !
        </p>
      </div>
    </>
  );
}
