export function Stats() {
  return (
    <div className="relative mt-16 grid grid-cols-3 gap-8 text-center sm:gap-16">
      <div>
        <p className="text-2xl font-bold text-foreground sm:text-3xl">$2.4B+</p>
        <p className="text-sm text-muted-foreground">Total Volume</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground sm:text-3xl">150K+</p>
        <p className="text-sm text-muted-foreground">Total Trades</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground sm:text-3xl">12+</p>
        <p className="text-sm text-muted-foreground">Supported Tokens</p>
      </div>
    </div>
  );
}
