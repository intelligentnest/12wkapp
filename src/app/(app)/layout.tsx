import { AppNav } from "@/components/app-nav";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUser(); // server-side verification, independent of the proxy
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 sm:pt-10">
      <header className="mb-6 space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-display text-lg text-ink">My 12-Week Transformation</p>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-ink-muted underline-offset-4 hover:underline">Sign out</button>
          </form>
        </div>
        <AppNav />
      </header>
      <main>{children}</main>
    </div>
  );
}
