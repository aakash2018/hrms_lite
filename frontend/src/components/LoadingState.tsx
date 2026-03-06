interface Props {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: Props) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      {message}
    </div>
  );
}
