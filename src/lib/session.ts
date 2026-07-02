import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 从 NextAuth session 中提取当前登录用户 ID
// 在 API 路由中调用，返回 userId 或 null（未登录）
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}
