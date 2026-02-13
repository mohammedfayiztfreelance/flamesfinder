const AppHeader = () => {
  return (
    <header className="relative w-full border-b border-border bg-background z-30">
      {/* Clean subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 pointer-events-none" />

      <div className="relative container mx-auto px-3 sm:px-4 py-10 sm:py-14 text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
          <span className="text-primary glow-text">FLAMES</span> Finder
        </h1>
      </div>
    </header>
  );
};

export default AppHeader;
