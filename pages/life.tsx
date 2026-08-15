import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LifeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace({ pathname: '/content', hash: 'life' });
  }, [router]);
  return null;
}
