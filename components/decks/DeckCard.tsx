interface DeckCardProps {
  title: string;
  description: string;
}

export default function DeckCard({
  title,
  description,
}: DeckCardProps) {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-300 hover:shadow-sm">
      <h3 className="text-base font-medium text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}