import useSWR from 'swr';
import { useUserId } from '../hooks/use-user-id.hook';
import { FormEventHandler, useEffect, useState } from 'react';
import Head from 'next/head';
import { swrFetcher } from '../common/utils';
import { UserEntity } from '@dializer/types';
import { AuthForm } from '../components/auth-form';
import { AuthInput } from '../components/auth-input';
import { Oval } from 'react-loader-spinner';
import { AuthSubmitBtn } from '../components/auth-submit';
import { ArrowLeft, Edit, X } from 'tabler-icons-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { LocalStorageItems } from '../common/types';

export default function ProfilePage() {
  const userId = useUserId();
  const { data, isLoading } = useSWR<UserEntity>(
    userId ? `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}` : null,
    swrFetcher
  );

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
      toast('Password and confirmed password does not match.', {
        type: 'error',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              LocalStorageItems.ACCESS_TOKEN
            )}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: name,
            email,
            password,
          }),
        }
      );

      if (!res.ok) {
        const jsonResp = (await res.json()) as { message: string };
        throw new Error(jsonResp.message);
      }

      toast('Profile updated successfully.', { type: 'success' });
      setIsEditing(false);
    } catch (e) {
      const err = e as Error;
      toast(err.message, { type: 'error' });
    }

    setIsSubmitting(false);
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
