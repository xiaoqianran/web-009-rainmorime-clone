import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function WorksRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace({ pathname: '/content', hash: 'works' });
  }, [router]);
  return null;
}
