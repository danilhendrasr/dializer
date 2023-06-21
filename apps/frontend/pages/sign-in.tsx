import Router from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { LocalStorageItems } from '../common/types';
import { toast } from 'react-toastify';
import { AuthForm } from '../components/auth-form';
import { AuthInput } from '../components/auth-input';
import { AuthTitle } from '../components/auth-title';
import { AuthSubmitBtn } from '../components/auth-submit';
import { useAuthorizedProtection } from '../hooks/use-authorized-protection.hook';
import { AuthService } from '../services/auth';
import { useForm, Controller } from 'react-hook-form';
import 'react-toastify/dist/ReactToastify.css';
import { Variants, motion } from 'framer-motion';

const pageChildrenVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const formInputsVariants: Variants = pageChildrenVariants;

type SignInInputs = {
  email: string;
  password: string;
};

export default function SignInPage() {
  useAuthorizedProtection();

  const {
    handleSubmit,
    watch,
    control,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<SignInInputs>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignIn = async (values: SignInInputs) => {
    try {
      const accessToken = await AuthService.getInstance().signIn(
        values.email,
        values.password
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
      className="sign-in-page w-full h-full"
    >
      <Head>
        <title>Sign In | Dializer</title>
      </Head>

      <motion.div
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3"
      >
        <AuthTitle variants={pageChildrenVariants}>Sign In</AuthTitle>
        <AuthForm
          variants={pageChildrenVariants}
          onSubmit={handleSubmit(handleSignIn)}
        >
          <Controller
            control={control}
            name="email"
            rules={{ required: true }}
            render={({ field }) => (
              <AuthInput
                type="email"
                placeholder="Email"
                {...field}
                motionProps={{ variants: formInputsVariants }}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            rules={{ required: true }}
            render={({ field }) => (
              <AuthInput
                type="password"
                placeholder="Password"
                {...field}
                motionProps={{ variants: formInputsVariants }}
              />
            )}
          />
          <Link
            href={`/forget-password?email=${watch('email')}`}
            passHref
            legacyBehavior
          >
            <motion.a className="w-fit text-xs mt-[-12px] transition hover:underline mb-2 ml-2 hover:text-secondary">
              Forgot your password?
            </motion.a>
          </Link>
          <AuthSubmitBtn
            isSubmitting={isSubmitting}
            disabled={!isDirty || !isValid || isSubmitting}
            text={isSubmitting ? 'Signin In...' : 'Sign in'}
            variants={{
              visible: {
                opacity: 1,
              },
              hidden: { opacity: 0 },
            }}
          />
        </AuthForm>
        <motion.p
          variants={pageChildrenVariants}
          className="text-sm text-center my-5 text-accent2"
        >
          Or register{' '}
          <Link
            href="/sign-up"
            className="text-accent1 underline hover:no-underline hover:text-secondary"
          >
            here
          </Link>
          !
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
