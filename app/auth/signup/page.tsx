import SignupForm from '../../../components/forms/SignupForm';
import { Toaster } from 'react-hot-toast';

export default function SignupPage() {
  return (
    <>
      <SignupForm />
      <Toaster position="top-right" />
    </>
  );
}
