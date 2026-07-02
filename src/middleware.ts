export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/compass/:path*",
    "/voyage/:path*",
    "/logbook/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
  ],
};
