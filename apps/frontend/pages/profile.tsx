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
import { ArrowLeft, Edit } from 'tabler-icons-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const userId = useUserId();
  const { data, isLoading, error } = useSWR<UserEntity>(
    userId ? `http://localhost:3333/api/users/${userId}` : null,
    swrFetcher
  );

  const [isEditing, setIsEditing] = useState(false);

  const handleEditSave: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    toast('Changes saved successfully.', { type: 'success' });
    setIsEditing(false);
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
          {isEditing ? null : (
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
              value={data.fullName}
              onChangeHandler={() => console.log('Name changes')}
              disabled={!isEditing}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email: </span>
            </label>
            <AuthInput
              type="email"
              value={data.email}
              onChangeHandler={() => console.log('Email changes')}
              disabled={!isEditing}
            />
          </div>
          {!isEditing ? null : (
            <AuthSubmitBtn
              text="Simpan"
              isSubmitting={false}
              disabled={false}
            />
          )}
        </AuthForm>
      </div>
    </>
  );
}
