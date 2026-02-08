import Link from "next/link";

export default function CategoryCard({ category }) {
  return (
    <Link
      href={`/forum/${category.slug}`}
      className="block p-4 border rounded hover:bg-gray-50"
    >
      <h2 className="font-semibold">{category.name}</h2>
    </Link>
  );
}
