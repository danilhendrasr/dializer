import Head from 'next/head';
import Link from 'next/link';
import { useUserId } from '../common/hooks';
import { useState } from 'react';
import { AuthForm } from '../components/auth-form';
import { AuthInput } from '../components/auth-input';
import { Oval } from 'react-loader-spinner';
import { AuthSubmitBtn } from '../components/auth-submit';
import { ArrowLeft, Edit, X } from 'tabler-icons-react';
import { toast } from 'react-toastify';
import * as userClient from '../services/user';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { UserEntity } from '@dializer/types';
import { motion } from 'framer-motion';

type ProfileInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const userId = useUserId();

  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => await userClient.getById(userId),
  });

  const { mutate } = useMutation({
    mutationFn: async (values: ProfileInputs) => {
      const { name, email, password } = values;
      await userClient.update(userId, {
        fullName: name,
        email,
        password,
      });
    },
    onSuccess: () => {
      toast.success('Profile updated successfully.');
      setIsEditing(false);
    },
    onError: (e) => {
      toast.error((e as Error).message);
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  if (!data || isLoading) {
    return (
      <Oval
        height={60}
        width={60}
        color="#570df8"
        secondaryColor="#e5e6e6"
        wrapperClass="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    );
  }

  return (
    <>
      <Head>
        <title>Profile | Dializer</title>
      </Head>

      <div className="w-2/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex justify-between items-center my-2">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
            >
              <Link href="/workspaces">
                <ArrowLeft
                  className="cursor-pointer hover:bg-base-200 active:scale-95"
                  size={20}
                />
              </Link>
            </motion.div>
            <h1 className="text-2xl">Personal Data</h1>
          </div>

          {/* Toggle edit mode button */}
          {isEditing ? (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
            >
              <X
                className="cursor-pointer hover:bg-base-200 active:scale-95"
                size={20}
                onClick={() => setIsEditing(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { delay: 0.5, duration: 0.2, type: 'spring' },
              }}
            >
              <Edit
                className="cursor-pointer hover:bg-base-200 active:scale-95"
                size={20}
                onClick={() => setIsEditing(true)}
              />
            </motion.div>
          )}
        </div>
        {/* End toggle edit mode button */}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PersonalDataForm
            isInEditMode={isEditing}
            data={data}
            onSubmit={mutate}
          />
        </motion.div>
      </div>
    </>
  );
}

type PersonalDataFormProps = {
  isInEditMode: boolean;
  data: UserEntity;
  onSubmit: (values: ProfileInputs) => void;
};

// Form is extracted to a separate component to make it work with
// react query.
const PersonalDataForm: React.FC<PersonalDataFormProps> = (props) => {
  const { isInEditMode, data, onSubmit } = props;

  const {
    handleSubmit,
    watch,
    control,
    formState: { isValid, isSubmitting, errors },
  } = useForm<ProfileInputs>({
    mode: 'onChange',
    defaultValues: {
      ...data,
      name: data.fullName,
    },
  });

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Name: </span>
        </label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <AuthInput placeholder="Full Name" {...field} />
          )}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email: </span>
        </label>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <AuthInput type="email" placeholder="Email" {...field} />
          )}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Password: </span>
        </label>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <AuthInput type="password" placeholder="Password" {...field} />
          )}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Confirm Password: </span>
        </label>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
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
      </div>
      {!isInEditMode ? null : (
        <AuthSubmitBtn
          isSubmitting={isSubmitting}
          disabled={!isValid || isSubmitting}
          text={isSubmitting ? 'Saving...' : 'Save'}
        />
      )}
    </AuthForm>
  );
};
