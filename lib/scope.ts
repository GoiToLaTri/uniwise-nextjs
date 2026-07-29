/**
 * Tách chuỗi scope thành Set các role/permission.
 * Ví dụ: "ROLE_USER course:create" thành hai phần tử riêng.
 */
export function parseScope(scope?: string | null): ReadonlySet<string> {
  if (!scope?.trim()) return new Set();
  return new Set(scope.trim().split(/\s+/));
}

/**
 * Kiểm tra session có đúng role/permission được yêu cầu không.
 */
export function hasScope(
  scope: string | null | undefined,
  authority: string,
): boolean {
  return parseScope(scope).has(authority);
}
