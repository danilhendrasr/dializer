import { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import 'tailwindcss/tailwind.css';
import 'react-toastify/dist/ReactToastify.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to Dializer!</title>
      </Head>
      <main className="w-full h-screen box-border" data-theme="light">
        <Component {...pageProps} />
      </main>
      <ToastContainer position="bottom-center" className="text-sm" />
    </>
  );
}

export default CustomApp;
