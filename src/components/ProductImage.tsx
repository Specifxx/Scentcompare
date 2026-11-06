/** A store's own product photo (hotlinked, lazy), or a plain placeholder. */
export function ProductImage({ src, alt, label, className = "", eager = false }: { src: string | null; alt: string; label: string; className?: string; eager?: boolean }) {
  if (!src)
    return (
      <div className={`grid place-items-center text-xs font-medium text-soft ${className}`} aria-label={`${alt} (no photo yet)`} role="img">
        <span aria-hidden>{label}</span>
      </div>
    );
  // text-transparent: if a store pulls its photo, the browser's broken-image
  // alt text does not spill over the tile.
  // eager is the page's own photo, its largest paint on a phone: fetched first (fetchpriority, as a plain attribute).
  const priority = eager ? ({ fetchpriority: "high" } as object) : {};
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" {...priority} referrerPolicy="no-referrer" className={`text-transparent ${className}`} />;
}
