import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/Card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordForm } from "@/components/profile/PasswordForm";

export const metadata: Metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const { email, profile } = await requireUser();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Perfil</h1>
        <p className="mt-1 text-sm text-ink-500">Gerencie seus dados e preferências de conta.</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-ink-900">Informações da conta</h2>
        <p className="mt-1 text-sm text-ink-500">
          E-mail: <span className="text-ink-700">{email}</span>
        </p>
        <p className="mt-3 text-xs text-ink-400">
          A alteração de e-mail não é feita por aqui, por segurança. Contate o suporte se
          precisar atualizá-lo.
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-ink-900">Nome</h2>
        <ProfileForm initialName={profile.name ?? ""} />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-ink-900">Alterar senha</h2>
        <PasswordForm />
      </Card>

      <Link href="/app/privacidade-dados">
        <Card className="transition-colors hover:border-brand-300">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Privacidade e meus dados</p>
              <p className="text-sm text-ink-500">
                Veja o que armazenamos e solicite acesso, correção ou exclusão.
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
