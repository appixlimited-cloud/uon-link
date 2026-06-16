import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FACULTIES, YEARS, INTERESTS } from "@/lib/categories";
import { toast } from "sonner";

export function SignupForm() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirm: "",
    registration_number: "", phone: "", faculty: "Arts", year_of_study: "First Year",
  });
  const [interests, setInterests] = useState<string[]>([]);

  function toggleInterest(i: string) {
    setInterests((cur) => cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]);
  }

  function startResendTimer() {
    setResendIn(60);
    const t = setInterval(() => setResendIn((n) => { if (n <= 1) { clearInterval(t); return 0; } return n - 1; }), 1000);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: form.full_name,
          registration_number: form.registration_number,
          faculty: form.faculty,
          year_of_study: form.year_of_study,
          phone: form.phone,
          interests,
        },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("registered")) {
        return toast.error("This email is already registered. Try logging in instead.");
      }
      return toast.error(error.message);
    }
    toast.success("Confirmation email sent!");
    setSent(true);
    startResendTimer();
  }

  async function resend() {
    if (resendIn > 0) return;
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: form.email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("New confirmation email sent");
    startResendTimer();
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card p-7 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Check Your Email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{form.email}</span>.
          Tap the <strong>Verify</strong> button in the email to activate your account.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Can't find it? Check your spam folder.</p>
        <div className="mt-6 space-y-2">
          <button onClick={resend} disabled={resendIn > 0 || loading} className="block w-full text-center text-sm text-primary hover:underline disabled:opacity-50">
            {resendIn > 0 ? `Resend email in ${resendIn}s` : "Resend confirmation email"}
          </button>
          <button onClick={() => navigate({ to: "/auth" })} className="block w-full text-center text-xs text-muted-foreground hover:text-foreground">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-7">
      <h2 className="text-2xl font-bold">Create Your Account</h2>
      <p className="text-sm text-muted-foreground mt-1">Join UoN Link to register for events and discover opportunities.</p>
      <form onSubmit={submitForm} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>Full Name</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="relative">
            <Label>Password</Label>
            <Input required type={show ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-7 text-muted-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          <div className="relative">
            <Label>Confirm Password</Label>
            <Input required type={show2 ? "text" : "password"} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            <button type="button" onClick={() => setShow2(!show2)} className="absolute right-2 top-7 text-muted-foreground">{show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          <div><Label>Student Registration Number</Label><Input placeholder="e.g. C02/12345/2023" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} /></div>
          <div><Label>Phone Number</Label><Input placeholder="+2547XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div>
            <Label>Faculty</Label>
            <Select value={form.faculty} onValueChange={(v) => setForm({ ...form, faculty: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FACULTIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Year of Study</Label>
            <Select value={form.year_of_study} onValueChange={(v) => setForm({ ...form, year_of_study: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Interests</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button key={i} type="button" onClick={() => toggleInterest(i)} className={`rounded-full px-3 py-1.5 text-sm ${interests.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"}`}>{i}</button>
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</Button>
        <p className="text-xs text-center text-muted-foreground">By creating an account you agree to our <Link to="/privacy" className="text-primary">Privacy Policy</Link> and <Link to="/terms" className="text-primary">Terms of Service</Link>.</p>
        <p className="text-sm text-center">Already have an account? <Link to="/auth" className="text-primary font-medium">Log in</Link></p>
      </form>
    </div>
  );
}
