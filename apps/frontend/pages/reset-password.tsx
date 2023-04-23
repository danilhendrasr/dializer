import Head from 'next/head';
import { FormEvent, useEffect, useState } from 'react';
import { AuthTitle } from '../components/auth-title';
import { AuthForm } from '../components/auth-form';
import { AuthInput } from '../components/auth-input';
import { AuthSubmitBtn } from '../components/auth-submit';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import * as base64 from 'base-64';

type TokenPayload = { id: string; email: string } | null;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingData, setIsSubmittingData] = useState(false);
  const [payload, setPayload] = useState<TokenPayload>(null);

  useEffect(() => {
    if (!router.isReady) return;
    console.log('token', router.query['token']);

    const decodedToken = base64.decode(router.query['token'] as string);

    const tokenPayload = JSON.parse(decodedToken) as {
      email: string;
      id: string;
    };

    setPayload(tokenPayload);
  }, [router.isReady]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('Password and confirmed password does not match.', {
        type: 'error',
      });
      return;
    }

    try {
      setIsSubmittingData(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/password`,
        {
          method: 'PUT',
          body: JSON.stringify({
            token: router.query['token'],
            new: newPassword,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        const jsonRes = await res.json();
        throw new Error(jsonRes.message);
      }

      toast(
        'Password changed successfully, you will be redirected to the login page, you can log in with your new password.',
        { type: 'success' }
      );
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (e) {
      const err = e as Error;
      toast(err.message, { type: 'error' });
    } finally {
      setIsSubmittingData(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | Dializer</title>
      </Head>

      <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3">
        <AuthTitle>Reset Password</AuthTitle>
        <AuthForm onSubmit={handleSubmit}>
          <p className="mb-4 text-sm">Reset password for: {payload?.email}.</p>
          <AuthInput
            id="password"
            name="password"
            placeholder="New Password"
            type="password"
            value={newPassword}
            onChangeHandler={(e) => setNewPassword(e.target.value)}
            disabled={isSubmittingData}
          />
          <AuthInput
            type="password"
            id="password"
            name="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeHandler={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmittingData}
          />
          <AuthSubmitBtn
            isSubmitting={isSubmittingData}
            disabled={!newPassword || !confirmPassword || isSubmittingData}
            text={isSubmittingData ? 'Resetting Password' : 'Reset Password'}
          />
        </AuthForm>
      </main>
    </>
  );
}
