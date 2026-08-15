import { Html, Head, Main, NextScript } from 'next/document';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function Document() {
  return (
    <Html lang="zh">
      <Head>
        <meta property="og:site_name" content="RAINMORIME" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="zh_CN" />
        <meta property="og:image" content={`${BASE}/avatar.jpg`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={`${BASE}/avatar.jpg`} />

        <link rel="icon" href={`${BASE}/avatar.jpg`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
        <link rel="alternate" type="application/rss+xml" title="RAINMORIME RSS" href={`${BASE}/rss.xml`} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
