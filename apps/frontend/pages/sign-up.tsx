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
import { AuthService } from '../services/auth';

export default function SignUpPage() {
  useAuthorizedProtection();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingData, setIsSubmitting] = useState(false);

  const isComplete = email && password && name;

  const handleSignUp: FormEventHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Password and password confirmation does not match.');
      return;
    }

    if (!isComplete) {
      toast.error('Please provide complete credentials');
      return;
    }

    try {
      setIsSubmitting(true);
      const accessToken = await AuthService.getInstance().signUp(
        name,
        email,
        password
      );

      localStorage.setItem(LocalStorageItems.ACCESS_TOKEN, accessToken);
      Router.replace('/workspaces');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
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
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <AuthInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AuthInput
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
