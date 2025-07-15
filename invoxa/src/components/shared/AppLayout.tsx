"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
 
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/" || pathname.startsWith("/auth/register");
  return isAuthPage ? <>{children}</> : <Header>{children}</Header>;
} 