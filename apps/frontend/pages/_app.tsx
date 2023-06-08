import { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import 'tailwindcss/tailwind.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/global.css';

function CustomApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <link
          rel="shortcut icon"
          href="dializer-logo-round-white.png"
          type="image/x-icon"
        />
      </Head>
      <QueryClientProvider client={new QueryClient()}>
        <main className="w-full h-screen box-border" data-theme="light">
          <AnimatePresence mode="wait">
            <Component {...pageProps} key={router.asPath} />
          </AnimatePresence>
        </main>
      </QueryClientProvider>
      <ToastContainer position="bottom-center" className="text-sm" />
    </>
  );
}

export default CustomApp;
