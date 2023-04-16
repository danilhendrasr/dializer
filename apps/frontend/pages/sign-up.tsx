import { AuthInput } from '../components/auth-input';
import { AuthTitle } from '../components/auth-title';
import { FormEventHandler, useState } from 'react';
import { AuthForm } from '../components/auth-form';
import { AuthSubmitBtn } from '../components/auth-submit';
import { toast } from 'react-toastify';
import { LocalStorageItems } from '../common/types';
import Router from 'next/router';
import { useAuthorizedProtection } from '../hooks/use-authorized-protection.hook';
import Link from 'next/link';
import Head from 'next/head';

export default function SignUpPage() {
  useAuthorizedProtection();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmittingData, setIsSubmitting] = useState(false);

  const isComplete = email && password && firstName;

  const handleSignUp: FormEventHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isComplete) {
      toast('Please provide complete credentials', { type: 'error' });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
          }),
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
      toast(error, { type: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up | Dializer</title>
      </Head>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3">
        <AuthTitle>Sign Up</AuthTitle>
        <AuthForm onSubmit={handleSignUp}>
          <AuthInput
            id="firstName"
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChangeHandler={(e) => setFirstName(e.target.value)}
          />
          <AuthInput
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChangeHandler={(e) => setLastName(e.target.value)}
          />
          <AuthInput
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChangeHandler={(e) => setEmail(e.target.value)}
          />
          <AuthInput
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChangeHandler={(e) => setPassword(e.target.value)}
          />
          <AuthSubmitBtn
            isSubmitting={isSubmittingData}
            disabled={!isComplete}
            text={isSubmittingData ? 'Signing Up...' : 'Sign up'}
          />
        </AuthForm>
        <p className="text-sm text-center my-5 text-accent2">
          Or{' '}
          <Link
            href="/sign-in"
            className="text-accent1 underline hover:no-underline hover:text-secondary"
          >
            sign in
          </Link>{' '}
          instead.
        </p>
      </div>
    </>
  );
}
