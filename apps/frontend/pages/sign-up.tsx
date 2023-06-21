import Link from 'next/link';
import Head from 'next/head';
import Router from 'next/router';
import { AuthInput } from '../components/auth-input';
import { AuthTitle } from '../components/auth-title';
import { AuthForm } from '../components/auth-form';
import { AuthSubmitBtn } from '../components/auth-submit';
import { toast } from 'react-toastify';
import { LocalStorageItems } from '../common/types';
import { useAuthorizedProtection } from '../hooks/use-authorized-protection.hook';
import { AuthService } from '../services/auth';
import { useForm, Controller } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';

const pageChildrenVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  hidden: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

type SignUpInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpPage() {
  useAuthorizedProtection();

  const {
    handleSubmit,
    watch,
    control,
    formState: { isDirty, isValid, isSubmitting, errors },
  } = useForm<SignUpInputs>({
    mode: 'onChange',
  });

  const handleSignUp = async (values: SignUpInputs) => {
    const { name, email, password } = values;

    try {
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
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      className="sign-up-page w-full h-full"
    >
      <Head>
        <title>Sign Up | Dializer</title>
      </Head>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            opacity: 1,
            transition: {
              when: 'beforeChildren',
              staggerChildren: 0.05,
            },
          },
          hidden: {
            opacity: 0,
            transition: {
              when: 'afterChildren',
            },
          },
        }}
      >
        <AuthTitle variants={pageChildrenVariants}>Sign Up</AuthTitle>
        <AuthForm
          variants={pageChildrenVariants}
          onSubmit={handleSubmit(handleSignUp)}
        >
          <Controller
            control={control}
            name="name"
            rules={{ required: true }}
            render={({ field }) => (
              <AuthInput placeholder="Full Name" {...field} />
            )}
          />
          <Controller
            control={control}
            name="email"
            rules={{ required: true }}
            render={({ field }) => (
              <AuthInput type="email" placeholder="Email" {...field} />
            )}
          />
          <Controller
            control={control}
            name="password"
            rules={{ required: true }}
            render={({ field }) => (
              <AuthInput type="password" placeholder="Password" {...field} />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: true,
              validate: (val: string) => {
                if (val != watch('password')) {
                  return 'Password do not match.';
                }
              },
            }}
            render={({ field }) => (
              <AuthInput
                type="password"
                placeholder="Confirm Password"
                bottomLabel={errors.confirmPassword?.message}
                {...field}
              />
            )}
          />
          <AuthSubmitBtn
            isSubmitting={isSubmitting}
            disabled={!isDirty || !isValid || isSubmitting}
            text={isSubmitting ? 'Signing Up...' : 'Sign up'}
          />
        </AuthForm>
        <motion.p
          variants={pageChildrenVariants}
          className="text-sm text-center my-5 text-accent2"
        >
          Or{' '}
          <Link
            href="/sign-in"
            className="text-accent1 underline hover:no-underline hover:text-secondary"
          >
            sign in
          </Link>{' '}
          instead.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
