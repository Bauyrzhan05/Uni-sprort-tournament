import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Input  from "../../components/common/Input";

/**
 * Login page
 * Backend: POST /api/auth/login  { email, password }
 * Returns: { token }
 */
function Login() {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    clearError();
    setLocalError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setLocalError("Please fill in all fields."); return; }
    setLoading(true);
    const result = await login({ email: form.email, password: form.password });
    setLoading(false);
    if (result.success) navigate("/dashboard");
  };

  const displayError = localError || error;

  return (
    <div className="card animate-in">
      <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
      <p className="text-sm text-slate-500 mb-6">Sign in to your account to continue</p>

      {displayError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address" name="email" type="email"
          placeholder="you@university.edu"
          value={form.email} onChange={handleChange} required autoComplete="email"
        />
        <Input
          label="Password" name="password" type="password"
          placeholder="••••••••"
          value={form.password} onChange={handleChange} required autoComplete="current-password"
        />
        <Button type="submit" className="w-full justify-center mt-2" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Don't have an account?{" "}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default Login;
