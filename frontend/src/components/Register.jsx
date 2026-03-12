import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  formCard, 
  formTitle, 
  inputClass, 
  submitBtn, 
  errorClass, 
  loadingClass,
  labelClass 
} from '../styles/common';

function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formObj) => {
    setLoading(true);
    setError(null);
    try {
      // Sending data to your custom local registration route
      const resObj = await axios.post("http://localhost:4000/api/user/register", formObj);
      
      if (resObj.status === 201) {
        toast.success("Registration successful! Please login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className={loadingClass}>Creating your account...</p>;

  return (
    <div className='min-h-screen flex items-center justify-center py-10'>
      <div className={formCard}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className={formTitle}>Create Account</h1>
          
          {error && <p className={`${errorClass} mb-4`}>{error}</p>}

          <div className='flex gap-4 mb-4'>
            <div className='w-1/2'>
              <label className={labelClass}>First Name</label>
              <input type="text" {...register("firstName", { required: "Required" })} className={inputClass} />
            </div>
            <div className='w-1/2'>
              <label className={labelClass}>Last Name</label>
              <input type="text" {...register("lastName", { required: "Required" })} className={inputClass} />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Choose a Username</label>
            <input type="text" {...register("username", { required: "Username is required" })} className={inputClass} />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Email Address</label>
            <input type="email" {...register("email", { required: "Email is required" })} className={inputClass} />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Mobile Number</label>
            <input type="text" {...register("mobile", { required: "Required" })} className={inputClass} />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Role</label>
            <select {...register("role", { required: "Select a role" })} className={inputClass}>
              <option value="">Select your role...</option>
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Password</label>
            <input 
              type="password" 
              {...register("password", { 
                required: "Required", 
                minLength: { value: 6, message: "Min 6 chars" } 
              })} 
              className={inputClass} 
            />
          </div>

          <button className={submitBtn}>Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default Register;