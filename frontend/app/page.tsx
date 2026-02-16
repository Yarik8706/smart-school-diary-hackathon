import ProjectHealth from "@/components/common/project-health";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-20">
      <header className="space-y-3">
        <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
          Smart School Diary
        </p>
        <h1 className="text-foreground text-4xl font-bold tracking-tight">
          Frontend initialized with core stack
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          App Router + TypeScript project scaffold with environment-based API
          client and shared folders.
        </p>
      </header>
      <ProjectHealth />
    </main>
  );
}
