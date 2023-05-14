import Head from 'next/head';
import { useRouter } from 'next/router';
import { AuthTitle } from '../components/auth-title';
import { AuthForm } from '../components/auth-form';
import { AuthInput } from '../components/auth-input';
import { AuthSubmitBtn } from '../components/auth-submit';
import { toast } from 'react-toastify';
import { UserService } from '../services/user';
import { useForm, Controller } from 'react-hook-form';

type ForgetPasswordInputs = {
  email: string;
};

export default function ForgetPasswordPage() {
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<ForgetPasswordInputs>({
    mode: 'onChange',
    defaultValues: {
      email: (router.query['email'] as string) ?? '',
    },
  });

  const submitResetEmailRequest = async (values: ForgetPasswordInputs) => {
    const { email } = values;

    try {
      await UserService.getInstance().sendPasswordResetEmail(email);
      toast.success(`Email sent to ${email}`);
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Forget Password | Dializer</title>
      </Head>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3">
        <AuthTitle>Forget Password</AuthTitle>
        <AuthForm onSubmit={handleSubmit(submitResetEmailRequest)}>
          <p className="mb-4 text-sm">
            An email with a link to reset your password will be sent to the
            following email:
          </p>
          <Controller
            control={control}
            name="email"
            rules={{ required: true }}
            render={({ field }) => (
              <AuthInput {...field} type="email" placeholder="Email" />
            )}
          />
          <AuthSubmitBtn
            isSubmitting={isSubmitting}
            disabled={!isDirty || !isValid || isSubmitting}
            text={isSubmitting ? 'Sending Email...' : 'Send Email'}
          />
        </AuthForm>
      </div>
    </>
  );
}
