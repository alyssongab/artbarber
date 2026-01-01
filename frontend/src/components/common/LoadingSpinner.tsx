import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = "Carregando...", fullScreen = true }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center bg-gray-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
