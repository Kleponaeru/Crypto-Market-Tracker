// src/app/test-auth/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);
  return <pre>{JSON.stringify(session, null, 2)}</pre>;
}
