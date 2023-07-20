import Head from 'next/head';
import { useEffect, useState } from 'react';
import { AuthTitle } from '../components/auth-title';
import { AuthForm } from '../components/auth-form';
import { AuthInput } from '../components/auth-input';
import { AuthSubmitBtn } from '../components/auth-submit';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import * as base64 from 'base-64';
import * as userClient from '../services/user';
import { useForm, Controller } from 'react-hook-form';

type TokenPayload = { id: string; email: string } | null;

type ResetPasswordInputs = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();

  const {
    handleSubmit,
    watch,
    control,
    formState: { isDirty, isValid, isSubmitting, errors },
  } = useForm<ResetPasswordInputs>({ mode: 'onChange' });

  const [payload, setPayload] = useState<TokenPayload>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const decodedToken = base64.decode(router.query['token'] as string);

    const tokenPayload = JSON.parse(decodedToken) as {
      email: string;
      id: string;
    };

    setPayload(tokenPayload);
  }, [router.isReady]);

  const resetPassword = async (values: ResetPasswordInputs) => {
    const { newPassword } = values;

    try {
      await userClient.resetPassword(
        router.query['token'] as string,
        newPassword
      );

      toast.success(
        'Password changed successfully, you will be redirected to the login page, you can log in with your new password.'
      );
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | Dializer</title>
      </Head>

      <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3">
        <AuthTitle>Reset Password</AuthTitle>
        <AuthForm onSubmit={handleSubmit(resetPassword)}>
          <p className="mb-4 text-sm">Reset password for: {payload?.email}.</p>
          <Controller
            control={control}
            name="newPassword"
            rules={{ required: true }}
            render={({ field }) => (
              <AuthInput
                {...field}
                type="password"
                placeholder="New Password"
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: true,
              validate: (value) => {
                if (value !== watch('newPassword')) {
                  return 'Password do not match.';
                }
              },
            }}
            render={({ field }) => (
              <AuthInput
                {...field}
                type="password"
                placeholder="Confirm Password"
                bottomLabel={errors.confirmPassword?.message}
              />
            )}
          />
          <AuthSubmitBtn
            isSubmitting={isSubmitting}
            disabled={!isDirty || !isValid || isSubmitting}
            text={isSubmitting ? 'Resetting Password' : 'Reset Password'}
          />
        </AuthForm>
      </main>
    </>
  );
}
