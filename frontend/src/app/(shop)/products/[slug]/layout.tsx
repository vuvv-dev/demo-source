/**
 * Self-contained layout for the product detail page.
 * Uses its own minimal header (breadcrumbs + buy button) so the
 * shop layout's full Navbar / Footer are intentionally excluded here.
 */
export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
