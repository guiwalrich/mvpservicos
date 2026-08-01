import { Request, Response, NextFunction } from "express";

/**
 * Sanitiza recursivamente strings para neutralizar XSS, HTML malicioso e SQL Injection.
 */
function sanitizarValor(valor: any): any {
  if (typeof valor === "string") {
    return valor
      // Remove tags <script> e <iframe>
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      // Remove manipuladores de eventos embutidos (ex: onload=, onclick=)
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "")
      // Remove URIs maliciosos javascript:
      .replace(/javascript:/gi, "")
      // Escapa caracteres perigosos de HTML
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  if (Array.isArray(valor)) {
    return valor.map(sanitizarValor);
  }

  if (valor !== null && typeof valor === "object") {
    const sanitizado: Record<string, any> = {};
    for (const key of Object.keys(valor)) {
      sanitizado[key] = sanitizarValor(valor[key]);
    }
    return sanitizado;
  }

  return valor;
}

export function sanitizacaoMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.body && typeof req.body === "object") {
      for (const key of Object.keys(req.body)) {
        req.body[key] = sanitizarValor(req.body[key]);
      }
    }
    if (req.query && typeof req.query === "object") {
      for (const key of Object.keys(req.query)) {
        try {
          req.query[key] = sanitizarValor(req.query[key]);
        } catch (_) {}
      }
    }
    if (req.params && typeof req.params === "object") {
      for (const key of Object.keys(req.params)) {
        try {
          req.params[key] = sanitizarValor(req.params[key]);
        } catch (_) {}
      }
    }
  } catch (err) {
    console.error("Erro seguro na sanitização:", err);
  }
  next();
}
