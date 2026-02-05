import { NextResponse, type NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // StackBlitz の preview(iframe) では cookie が保持できずログインループになりがちなので
  // middleware での cookie 認証は行わない（各ページ/各APIで Bearer トークン認証に寄せる）
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/buddy/:path*"]
};
