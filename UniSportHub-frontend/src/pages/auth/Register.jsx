import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Input  from "../../components/common/Input";

/**
 * Register page
 * Backend: POST /api/auth/register  { username, email, password }
 * Returns: { token }
 */
function Register() {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    clearError();
    setLocalError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.username.trim()) return "Username is required.";
    if (!form.email)           return "Email is required.";
    if (!form.password)        return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setLocalError(err); return; }
    setLoading(true);
    // Send exactly what backend expects: { username, email, password }
    const result = await register({
      username: form.username,
      email:    form.email,
      password: form.password,
    });
    setLoading(false);
    if (result.success) navigate("/dashboard");
  };

  const displayError = localError || error;

  return (
    <div className="card animate-in">
      <h2 className="text-xl font-semibold text-white mb-1">Create account</h2>
      <p className="text-sm text-slate-500 mb-6">Join UniSportHub today</p>

      {displayError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Username" name="username" placeholder="johndoe"
          value={form.username} onChange={handleChange} required
        />
        <Input
          label="Email address" name="email" type="email"
          placeholder="you@university.edu"
          value={form.email} onChange={handleChange} required
        />
        <Input
          label="Password" name="password" type="password"
          placeholder="Min. 6 characters"
          value={form.password} onChange={handleChange} required
        />
        <Input
          label="Confirm password" name="confirmPassword" type="password"
          placeholder="Repeat password"
          value={form.confirmPassword} onChange={handleChange} required
        />
        <Button type="submit" className="w-full justify-center mt-2" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;
