import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
}

export default function ErrorBanner({ message }: Props) {
  return (
    <div className="error-banner">
      <AlertCircle size={16} />
      {message}
    </div>
  );
}
