import { FormEventHandler, useEffect, useState } from 'react';
import Router from 'next/router';
import { LocalStorageItems } from '../../common/types';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem(LocalStorageItems.ACCESS_TOKEN);
    if (accessToken) Router.replace('/workspaces');
  }, []);

  const handleSignIn: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast('Please provide complete credentials', { type: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const jsonResponse = await response.json();
      if (!response.ok) throw new Error(jsonResponse);

      localStorage.setItem(
        LocalStorageItems.ACCESS_TOKEN,
        jsonResponse.access_token
      );
      Router.replace('/workspaces');
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Dializer</title>
      </Head>
      <PageWrapper>
        <h1>Sign In</h1>
        <SignInForm
          onSubmit={handleSignIn}
          canSubmit={Boolean(username && password)}
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            name="username"
            id="username"
            placeholder="Username"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
            id="password"
            placeholder="Password"
          />
          <input type="submit" value="Sign in" />
        </SignInForm>
      </PageWrapper>
      <ToastContainer position="bottom-center" />
    </>
  );
}

const PageWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-family: sans-serif;
    letter-spacing: 2px;
    margin-bottom: 30px;
  }
`;

const SignInForm = styled.form<{ canSubmit: boolean }>`
  width: 250px;
  padding: 10px 20px;
  border: 1px solid grey;
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  input {
    margin: 10px 0;
    border: 1px solid lightgrey;
    padding: 10px;
  }

  input[type='submit'] {
    color: white;
    border: none;
    background-color: ${(p) => (p.canSubmit ? 'black' : 'darkgrey')};
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      cursor: pointer;
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;
