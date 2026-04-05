"use client";

export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto md:overflow-x-visible md:flex-wrap pb-1 scrollbar-hide">
      {/* All pill */}
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
          !activeCategory
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
        }`}
      >
        All Stories
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug === activeCategory ? null : cat.slug)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            activeCategory === cat.slug
              ? "shadow-md text-white"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
          }`}
          style={
            activeCategory === cat.slug
              ? {
                  backgroundColor: cat.color,
                  boxShadow: `0 4px 14px ${cat.color}40`,
                }
              : {}
          }
        >
          <span>{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
