import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  role: string;
  // Agrega otras propiedades según sea necesario
}

export function middleware(request: NextRequest) {
  const encryptedToken = request.cookies.get("token")?.value || ""; // Obtiene el token de la cookie
  const { pathname, origin } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Si no hay token y accede a rutas protegidas, redirigir a /login
  if (!encryptedToken && isDashboardRoute) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Si hay token, decodificarlo y verificar el rol
  if (encryptedToken) {
    try {
      const decoded: DecodedToken = jwtDecode(encryptedToken);

      // Redirigir si el rol no es "admin" y está accediendo al dashboard
      if (isDashboardRoute && decoded.role !== "admin") {
        return NextResponse.redirect(`${origin}`);
      }

      // Redirigir a /dashboard si intenta acceder a /login con un token válido
      if (pathname === "/login") {
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    } catch (error) {
      // Token no válido o mal formado
      console.error("Error decoding token:", error);
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  // Si no se cumple ninguna de las condiciones anteriores, continuar con la solicitud
  return NextResponse.next();
}
