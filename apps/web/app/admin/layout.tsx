import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@school-admin/ui";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Administration</h2>
          <p className="text-sm text-muted-foreground">
            {session.user.firstName} {session.user.lastName}
          </p>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              Tableau de bord
            </Button>
          </Link>
          <Link href="/admin/school/academic-years">
            <Button variant="ghost" className="w-full justify-start">
              Années scolaires
            </Button>
          </Link>
          <Link href="/admin/school/classes">
            <Button variant="ghost" className="w-full justify-start">
              Classes
            </Button>
          </Link>
          <Link href="/admin/school/rooms">
            <Button variant="ghost" className="w-full justify-start">
              Salles
            </Button>
          </Link>
          <Link href="/admin/school/levels">
            <Button variant="ghost" className="w-full justify-start">
              Niveaux
            </Button>
          </Link>
          <Link href="/admin/students">
            <Button variant="ghost" className="w-full justify-start">
              Élèves
            </Button>
          </Link>
          <Link href="/admin/teachers">
            <Button variant="ghost" className="w-full justify-start">
              Professeurs
            </Button>
          </Link>
          <Link href="/admin/subjects">
            <Button variant="ghost" className="w-full justify-start">
              Matières
            </Button>
          </Link>
          <Link href="/admin/timetable">
            <Button variant="ghost" className="w-full justify-start">
              Emploi du Temps
            </Button>
          </Link>
          <Link href="/admin/attendance">
            <Button variant="ghost" className="w-full justify-start">
              Présences
            </Button>
          </Link>
          <Link href="/admin/justifications">
            <Button variant="ghost" className="w-full justify-start">
              Justificatifs
            </Button>
          </Link>
          <Link href="/admin/grades">
            <Button variant="ghost" className="w-full justify-start">
              Notes & Évaluations
            </Button>
          </Link>
          <Link href="/admin/report-cards">
            <Button variant="ghost" className="w-full justify-start">
              Bulletins
            </Button>
          </Link>
          <Link href="/admin/messages">
            <Button variant="ghost" className="w-full justify-start">
              Messagerie
            </Button>
          </Link>
          <Link href="/admin/announcements">
            <Button variant="ghost" className="w-full justify-start">
              Annonces
            </Button>
          </Link>
          <Link href="/admin/documents">
            <Button variant="ghost" className="w-full justify-start">
              Documents & Exports
            </Button>
          </Link>
          <Link href="/admin/rgpd">
            <Button variant="ghost" className="w-full justify-start">
              RGPD & Consentements
            </Button>
          </Link>
          <Link href="/admin/audit">
            <Button variant="ghost" className="w-full justify-start">
              Audit Log
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
