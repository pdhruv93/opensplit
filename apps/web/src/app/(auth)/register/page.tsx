import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "OpenSplit";

  return <RegisterForm brandName={brandName} />;
}
