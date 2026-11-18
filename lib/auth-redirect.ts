export function getSafeReturnPath(next: string | null): string {
  if (
    !next?.startsWith("/") ||
    /^\/(?:\/|%2f)/i.test(next) ||
    /[\\\u0000-\u001f\u007f-\u009f]|%(?:0[0-9a-f]|1[0-9a-f]|5c|7f)/i.test(next) ||
    new URL(next, "https://return.invalid").pathname.startsWith("//")
  ) {
    return "/dashboard";
  }
  return next;
}
