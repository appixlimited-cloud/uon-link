import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FACULTIES, YEARS, INTERESTS } from "@/lib/categories";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — UoN Link" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirm: "",
    registration_number: "", phone: "", faculty: "Arts", year_of_study: "First Year",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);

  function toggleInterest(i: string) {
    setInterests((cur) => cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]);
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
    if (error) { setLoading(false); return toast.error(error.message); }
    // Send OTP for verification
    const { error: otpErr } = await supabase.auth.signInWithOtp({ email: form.email, options: { shouldCreateUser: false } });
    setLoading(false);
    if (otpErr) {
      // Account created but OTP failed — still go to verify with manual mark
      toast.warning("Account created. Verification email may take a moment.");
    } else {
      toast.success("We sent a 6-digit code to your email");
    }
    setStep("verify");
    startResendTimer();
  }

  function startResendTimer() {
    setResendIn(60);
    const t = setInterval(() => setResendIn((n) => { if (n <= 1) { clearInterval(t); return 0; } return n - 1; }), 1000);
  }

  async function resend() {
    const { error } = await supabase.auth.signInWithOtp({ email: form.email, options: { shouldCreateUser: false } });
    if (error) return toast.error(error.message);
    toast.success("New code sent");
    startResendTimer();
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter the 6-digit code");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: form.email, token: otp, type: "email" });
    if (error) { setLoading(false); return toast.error("Incorrect code. Please try again."); }
    // Mark profile verified
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("student_profiles").update({ is_verified: true }).eq("user_id", user.id);
    setLoading(false);
    toast.success("Account verified!");
    navigate({ to: "/dashboard", replace: true });
  }

  if (step === "verify") {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="rounded-lg border border-border bg-card p-7">
            <h1 className="text-2xl font-bold">Verify Your Email</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code sent to {form.email}.</p>
            <form onSubmit={verify} className="mt-6 space-y-4">
              <div className="flex justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input key={i} maxLength={1} value={otp[i] ?? ""} inputMode="numeric"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      const next = (otp.slice(0, i) + v + otp.slice(i + 1)).slice(0, 6);
                      setOtp(next);
                      if (v && i < 5) (e.target.nextElementSibling as HTMLInputElement | null)?.focus();
                    }}
                    className="h-12 w-10 rounded border border-input bg-background text-center text-lg font-bold focus:border-primary focus:outline-none" />
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Verifying..." : "Verify"}</Button>
              <button type="button" onClick={resend} disabled={resendIn > 0} className="block w-full text-center text-sm text-primary hover:underline disabled:opacity-50">
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </button>
            </form>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-lg border border-border bg-card p-7">
          <h1 className="text-2xl font-bold">Create Your Account</h1>
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
              <div><Label>Phone Number</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
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
          </form>
        </div>
      </div>
    </PageShell>
  );
}
