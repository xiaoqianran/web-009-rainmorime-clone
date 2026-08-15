import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ExperienceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace({ pathname: '/content', hash: 'experience' });
  }, [router]);
  return null;
}
