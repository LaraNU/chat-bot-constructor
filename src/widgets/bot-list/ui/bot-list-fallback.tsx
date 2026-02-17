export const BotListFallback = () => (
  <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-48 rounded-lg bg-gray-200" />
    ))}
  </div>
);
