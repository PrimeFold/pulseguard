declare global {
  interface RequestInit {
    next?: { revalidate?: number; tags?: string[] };
  }
}
export {};
