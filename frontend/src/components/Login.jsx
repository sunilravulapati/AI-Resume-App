import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useUserStore from '../store/userStore';
import { 
  formCard, 
  formTitle, 
  inputClass, 
  submitBtn, 
  errorClass, 
  loadingClass,
  labelClass 
} from '../styles/common';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { fetchUser, userRecord } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onUserLogin = async (userCredObj) => {
    setLoading(true);
    setError(null);
    try {
      // Adjusted to your custom backend login logic
      const resObj = await axios.post("http://localhost:4000/api/user/login", {
        loginIdentifier: userCredObj.email, // Can be email or username
        password: userCredObj.password
      });

      const { token, user } = resObj.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Sync global store
      await fetchUser(); 
      
      toast.success("Logged in successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRecord) {
      if (userRecord.role === 'student') navigate('/student-dashboard');
      else if (userRecord.role === 'recruiter') navigate('/recruiter-dashboard');
      else navigate('/');
    }
  }, [userRecord, navigate]);

  if (loading) return <p className={loadingClass}>Verifying credentials...</p>;

  return (
    <div className='min-h-[80vh] flex items-center justify-center'>
      <div className={formCard}>
        <form onSubmit={handleSubmit(onUserLogin)}>
          <h1 className={formTitle}>Welcome Back</h1>
          
          {error && <p className={`${errorClass} mb-4`}>{error}</p>}

          <div className="mb-4">
            <label className={labelClass}>Email or Username</label>
            <input 
              type="text" 
              placeholder='your@email.com'
              {...register("email", { required: "Identity is required" })}
              className={inputClass}
            />
            {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label className={labelClass}>Password</label>
            <input 
              type="password" 
              placeholder='••••••••'
              {...register("password", { required: "Password is required" })}
              className={inputClass}
            />
            {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>}
          </div>

          <button className={submitBtn}>Log In</button>
        </form>
      </div>
    </div>
  );
}

export default Login;