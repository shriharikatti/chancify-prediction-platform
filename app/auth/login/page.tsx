import LoginForm from '../../../components/forms/LoginForm';
import { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <Toaster position="top-right" />
    </>
  );
}
