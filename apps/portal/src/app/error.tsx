'use client';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'monospace', color: 'red' }}>
          <h2>FATAL ROOT ERROR</h2>
          <p>{error.name}: {error.message}</p>
          <pre style={{ fontSize: '10px' }}>{error.stack}</pre>
          <button onClick={() => reset()}>Retry</button>
        </div>
      </body>
    </html>
  );
}
