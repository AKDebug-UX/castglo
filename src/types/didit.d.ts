declare module '@didit-protocol/sdk-web' {
  export interface DiditOpenSelfieOptions {
    url: string;
    onComplete?: () => void;
    onError?: (error: unknown) => void;
  }

  export const DiditSdk: {
    openSelfie: (options: DiditOpenSelfieOptions) => void;
    [key: string]: unknown;
  };
}
