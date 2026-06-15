import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "OpenSplit";

  return <LoginForm brandName={brandName} />;
}
