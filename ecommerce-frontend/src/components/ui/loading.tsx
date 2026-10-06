import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export default function Loading({ size = 'md', text, fullPage = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className={clsx('animate-spin text-blue-600', sizeClasses[size])} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
