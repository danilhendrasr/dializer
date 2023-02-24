import {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useState,
} from 'react';
import Router from 'next/router';
import { LocalStorageItems } from '../../common/types';
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
      toast(error, { type: 'error' });
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Dializer</title>
      </Head>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="text-4xl text-center font-bold tracking-wider font-sans m-5 text-accent2">
          Sign In
        </h1>
        <form
          className="flex flex-col p-10 border-solid shadow-lg rounded-md"
          onSubmit={handleSignIn}
        >
          <LoginInput
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChangeHandler={(e) => setUsername(e.target.value)}
          />
          <LoginInput
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChangeHandler={(e) => setPassword(e.target.value)}
          />
          <input
            disabled={!username || !password}
            type="submit"
            value="Sign in"
            className="my-2 py-2 w-full text-primary1 bg-accent1 rounded-md transition cursor-pointer disabled:bg-primary2 disabled:pointer-events-none active:scale-95"
          />
        </form>
      </div>
      <ToastContainer position="bottom-center" />
    </>
  );
}

const LoginInput: React.FC<{
  type?: 'text' | 'password';
  id?: string;
  placeholder?: string;
  name?: string;
  value: string;
  onChangeHandler: ChangeEventHandler<HTMLInputElement>;
}> = (props) => {
  const {
    type = 'text',
    id,
    placeholder,
    name,
    value,
    onChangeHandler,
  } = props;

  return (
    <input
      type={type}
      value={value}
      onChange={onChangeHandler}
      name={name}
      id={id}
      placeholder={placeholder}
      className="px-4 py-2 mb-5 border border-solid border-primary2 rounded-md"
    />
  );
};
