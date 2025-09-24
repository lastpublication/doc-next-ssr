import React from 'react';
import { GetServerSideProps } from 'next';
import Button from '../components/Button';

/**
 * Home page component that demonstrates SSR and client-side functionality
 */

interface HomeProps {
  /** Server-rendered data */
  serverData: {
    timestamp: string;
    message: string;
  };
}

export default function Home({ serverData }: HomeProps) {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <p>Server rendered at: {serverData.timestamp}</p>
      <p>Message: {serverData.message}</p>
      
      <div>
        <p>Client-side counter: {count}</p>
        <Button onClick={() => setCount(count + 1)}>
          Increment
        </Button>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  return {
    props: {
      serverData: {
        timestamp: new Date().toISOString(),
        message: 'This data was fetched on the server!'
      }
    }
  };
};