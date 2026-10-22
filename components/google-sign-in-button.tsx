"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityApi {
  initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
  renderButton(element: HTMLElement, options: { theme: "outline"; size: "large"; text: "continue_with"; width: number }): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityApi } };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => Promise<void>;
  onError: (error: Error) => void;
}

export function GoogleSignInButton({ onCredential, onError }: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    if (!clientId || !scriptReady || !containerRef.current || !window.google) return;

    const container = containerRef.current;
    container.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        void onCredentialRef.current(response.credential).catch((error: unknown) => {
          onErrorRef.current(error instanceof Error ? error : new Error("Google sign-in failed"));
        });
      }
    });
    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      width: Math.max(200, Math.min(400, Math.floor(container.getBoundingClientRect().width)))
    });
  }, [clientId, scriptReady]);

  if (!clientId) {
    return <p role="status" className="text-center text-sm text-gray-600">Google sign-in is not configured.</p>;
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => onError(new Error("Unable to load Google sign-in. Please try again."))}
      />
      <div ref={containerRef} className="flex min-h-10 justify-center" />
    </>
  );
}
