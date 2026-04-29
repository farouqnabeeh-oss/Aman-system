'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'monospace', color: 'red', background: 'white' }}>
          <h2>FATAL GLOBAL ERROR</h2>
          <p>{error.name}: {error.message}</p>
          <pre style={{ fontSize: '12px' }}>{error.stack}</pre>
          <button onClick={() => reset()}>Retry</button>
        </div>
      </body>
    </html>
  );
}
