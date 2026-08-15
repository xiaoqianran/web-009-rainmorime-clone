import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const GameLayout = dynamic(() => import('../components/game/GameLayout'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0e1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#b2f2bb',
      fontSize: '14px',
      letterSpacing: '2px',
    }}>
      SYSTEM LOADING...
    </div>
  ),
});

export default function GamePage() {
  return (
    <>
      <Head>
        <title>RAINMORIME — TERMINAL</title>
        <meta name="description" content="森雨行动 — 终端界面" />
      </Head>
      <GameLayout />
    </>
  );
}
