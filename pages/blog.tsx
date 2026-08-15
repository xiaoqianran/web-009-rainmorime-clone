import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BlogRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace({ pathname: '/content', hash: 'blog' });
  }, [router]);
  return null;
}
