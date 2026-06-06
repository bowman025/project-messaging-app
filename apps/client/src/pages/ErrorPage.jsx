import { useRouteError, useNavigate } from 'react-router';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const getErrorMessage = () => {
    if (error instanceof Response) {
      return `${error.status} ${error.statusText || 'Error'}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  };

  return (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p>{getErrorMessage()}</p>
      <div>
        <button onClick={() => navigate('/conversations')}>Go home</button>
      </div>
    </div>
  );
}
