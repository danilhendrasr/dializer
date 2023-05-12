import Head from 'next/head';
import { useRouter } from 'next/router';
import { AuthTitle } from '../components/auth-title';
import { AuthForm } from '../components/auth-form';
import { FormEvent, useState } from 'react';
import { AuthInput } from '../components/auth-input';
import { AuthSubmitBtn } from '../components/auth-submit';
import { toast } from 'react-toastify';
import { UserService } from '../services/user';

export default function ForgetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState((router.query['email'] as string) ?? '');
  const [isSubmittingData, setIsSubmittingData] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingData(true);

    try {
      await UserService.getInstance().sendPasswordResetEmail(email);
      toast.success(`Email sent to ${email}`);
      setEmail('');
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }

    setIsSubmittingData(false);
  };

  return (
    <>
      <Head>
        <title>Forget Password | Dializer</title>
      </Head>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3">
        <AuthTitle>Forget Password</AuthTitle>
        <AuthForm onSubmit={handleSubmit}>
          <p className="mb-4 text-sm">
            An email with a link to reset your password will be sent to the
            following email:
          </p>
          <AuthInput
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChangeHandler={(e) => setEmail(e.target.value)}
            disabled={isSubmittingData}
          />
          <AuthSubmitBtn
            isSubmitting={isSubmittingData}
            disabled={!email || isSubmittingData}
            text={isSubmittingData ? 'Sending Email...' : 'Send Email'}
          />
        </AuthForm>
      </div>
    </>
  );
}
