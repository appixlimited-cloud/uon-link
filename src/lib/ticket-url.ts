export function verifyUrl(ticketCode: string) {
  if (typeof window === "undefined") return `/verify/${ticketCode}`;
  return `${window.location.origin}/verify/${ticketCode}`;
}
