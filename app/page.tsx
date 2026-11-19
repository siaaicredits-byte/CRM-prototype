import { redirect } from "next/navigation";

// The CRM lives under /dashboard; send the root URL there.
export default function Home() {
  redirect("/dashboard");
}
