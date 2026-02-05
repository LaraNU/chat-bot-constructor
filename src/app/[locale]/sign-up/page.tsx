import { SignUpForm } from '@/features/sign-up-form';
import { Link } from '@/i18n/navigation';

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Get started with BotFlow for free</p>
        </div>

        <SignUpForm />

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
