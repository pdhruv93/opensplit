import Link from "next/link";
import { getClient } from "@/lib/api";
import { UserMenu } from "./user-menu";

export async function Navbar() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "OpenSplit";
  const client = await getClient();
  const user = await client.users.me();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold text-teal-500">
          {brandName}
        </Link>
        <UserMenu firstName={user.firstName} lastName={user.lastName} />
      </div>
    </header>
  );
}
