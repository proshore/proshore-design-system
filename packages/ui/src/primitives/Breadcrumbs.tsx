import { Breadcrumb, Breadcrumbs as RACBreadcrumbs, Link } from "react-aria-components";

/** Breadcrumbs for pages deeper than two levels. The last item is the current page and is not a link. */
export function Breadcrumbs({ items, label = "Breadcrumb" }: { items: { label: string; href?: string }[]; label?: string }) {
  return (
    <RACBreadcrumbs className="pr-crumbs" aria-label={label}>
      {items.map((i, n) => (<Breadcrumb key={n} className="pr-crumb">{i.href && n < items.length - 1 ? <Link href={i.href} className="pr-crumb__link">{i.label}</Link> : <Link className="pr-crumb__link" isDisabled>{i.label}</Link>}</Breadcrumb>))}
    </RACBreadcrumbs>
  );
}
