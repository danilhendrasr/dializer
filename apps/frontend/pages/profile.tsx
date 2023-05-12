import Head from 'next/head';
import Link from 'next/link';
import { useUserId } from '../hooks/use-user-id.hook';
import { FormEventHandler, useEffect, useState } from 'react';
import { AuthForm } from '../components/auth-form';
import { AuthInput } from '../components/auth-input';
import { Oval } from 'react-loader-spinner';
import { AuthSubmitBtn } from '../components/auth-submit';
import { ArrowLeft, Edit, X } from 'tabler-icons-react';
import { toast } from 'react-toastify';
import { UserService } from '../services/user';
import { useQuery } from '@tanstack/react-query';

export default function ProfilePage() {
  const userId = useUserId();

  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => await UserService.getInstance().getById(userId),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(data?.fullName ?? '');
  const [email, setEmail] = useState(data?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!data) return;
    setName(data.fullName);
    setEmail(data.email);
  }, [data]);

  const handleEditSave: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      toast.error('Password and confirmed password does not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      await UserService.getInstance().update(userId, {
        fullName: name,
        email,
        password,
      });

      toast.success('Profile updated successfully.');
      setIsEditing(false);
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Link href="/workspaces">
              <ArrowLeft
                className="cursor-pointer hover:bg-base-200 active:scale-95"
                size={20}
              />
            </Link>
            <h1 className="text-2xl">Personal Data</h1>
          </div>
          {isEditing ? (
            <X
              className="cursor-pointer hover:bg-base-200 active:scale-95"
              size={20}
              onClick={() => setIsEditing(false)}
            />
          ) : (
            <Edit
              className="cursor-pointer hover:bg-base-200 active:scale-95"
              size={20}
              onClick={() => setIsEditing(true)}
            />
          )}
        </div>
        <AuthForm onSubmit={handleEditSave}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name: </span>
            </label>
            <AuthInput
              type="text"
              value={name}
              onChangeHandler={(e) => setName(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email: </span>
            </label>
            <AuthInput
              type="email"
              value={email}
              onChangeHandler={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password: </span>
            </label>
            <AuthInput
              type="password"
              value={password}
              onChangeHandler={(e) => setPassword(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm Password: </span>
            </label>
            <AuthInput
              type="password"
              value={confirmPassword}
              onChangeHandler={(e) => setConfirmPassword(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          {!isEditing ? null : (
            <AuthSubmitBtn text="Save" isSubmitting={isSubmitting} />
          )}
        </AuthForm>
      </div>
    </>
  );
}
