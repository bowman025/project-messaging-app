import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router';
import { registerSchema } from '@project-messaging-app/zod-schemas/user';
import { useAuthStore } from '../store/authStore.js';
import { fetchWithAuth } from '../lib/api.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetchWithAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError('root', { message: json.message });
        return;
      }

      setAuth(json.token, json.user);
      navigate('/conversations');
    } catch (_err) {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="auth-form">
      <h1>Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input id="username" type="text" {...register('username')} />
          {errors.username && <p className="form-error">{errors.username.message}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password')} />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
        </div>
        {errors.root && <p className="form-root-error">{errors.root.message}</p>}
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
