import { FormEventHandler, useState } from 'react';
import Router from 'next/router';
import { LocalStorageItems } from '../common/types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import { AuthForm } from '../components/auth-form';
import { AuthInput } from '../components/auth-input';
import { AuthTitle } from '../components/auth-title';
import { AuthSubmitBtn } from '../components/auth-submit';
import { useAuthorizedProtection } from '../hooks/use-authorized-protection.hook';
import Link from 'next/link';

export default function SignInPage() {
  useAuthorizedProtection();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmittingData, setIsSubmitting] = useState(false);

  const handleSignIn: FormEventHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!email || !password) {
      toast('Please provide complete credentials', { type: 'error' });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({
            username: email,
            password,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const jsonResponse = await response.json();
      if (!response.ok) throw new Error(jsonResponse.message);

      localStorage.setItem(
        LocalStorageItems.ACCESS_TOKEN,
        jsonResponse.access_token
      );

      Router.replace('/workspaces');
    } catch (error) {
      const err = error as { statusCode: number; message: string };
      toast(err.message, { type: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Dializer</title>
      </Head>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3">
        <AuthTitle>Sign In</AuthTitle>
        <AuthForm onSubmit={handleSignIn}>
          <AuthInput
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChangeHandler={(e) => setEmail(e.target.value)}
            disabled={isSubmittingData}
          />
          <AuthInput
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChangeHandler={(e) => setPassword(e.target.value)}
            disabled={isSubmittingData}
          />
          <Link
            href={`/forget-password${email ? '?email=' + email : ''}`}
            className="w-fit text-xs mt-[-12px] transition hover:underline mb-2 ml-2 hover:text-secondary"
          >
            Forgot your password?
          </Link>
          <AuthSubmitBtn
            isSubmitting={isSubmittingData}
            disabled={!email || !password || isSubmittingData}
            text={isSubmittingData ? 'Signin In...' : 'Sign in'}
          />
        </AuthForm>
        <p className="text-sm text-center my-5 text-accent2">
          Or register{' '}
          <Link
            href="/sign-up"
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
