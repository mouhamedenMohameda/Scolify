import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import Link from "next/link";
import { Button } from "@school-admin/ui";
import { prisma } from "@school-admin/db";

// Simple SVG Icons
const StudentIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ClassIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const TeacherIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SubjectIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const RoomIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LevelIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default async function DashboardPage() {
  const session = await requireAuth();

  const schoolId = session.tenantId || undefined;

  // Get comprehensive statistics
  const [
    studentCount,
    classCount,
    teacherCount,
    subjectCount,
    roomCount,
    academicYearCount,
    levelCount,
  ] = await Promise.all([
    prisma.student.count({
      where: schoolId ? { schoolId, status: "ENROLLED" } : { status: "ENROLLED" },
    }),
    prisma.class.count({
      where: schoolId
        ? { schoolId, academicYear: { isActive: true } }
        : { academicYear: { isActive: true } },
    }),
    prisma.teacher.count({
      where: schoolId ? { schoolId } : undefined,
    }),
    prisma.subject.count({
      where: schoolId ? { schoolId } : undefined,
    }),
    prisma.room.count({
      where: schoolId ? { schoolId } : undefined,
    }),
    prisma.academicYear.count({
      where: schoolId ? { schoolId, isActive: true } : { isActive: true },
    }),
  ]);

  const statCards = [
    {
      title: "Élèves",
      value: studentCount,
      description: "Élèves inscrits",
      icon: <StudentIcon />,
      color: "bg-blue-500",
      href: "/admin/students",
    },
    {
      title: "Classes",
      value: classCount,
      description: "Classes actives",
      icon: <ClassIcon />,
      color: "bg-green-500",
      href: "/admin/school/classes",
    },
    {
      title: "Professeurs",
      value: teacherCount,
      description: "Professeurs actifs",
      icon: <TeacherIcon />,
      color: "bg-purple-500",
      href: "/admin/teachers",
    },
    {
      title: "Matières",
      value: subjectCount,
      description: "Matières enseignées",
      icon: <SubjectIcon />,
      color: "bg-orange-500",
      href: "/admin/subjects",
    },
    {
      title: "Salles",
      value: roomCount,
      description: "Salles disponibles",
      icon: <RoomIcon />,
      color: "bg-teal-500",
      href: "/admin/school/rooms",
    },
    {
      title: "Années Scolaires",
      value: academicYearCount,
      description: "Années actives",
      icon: <CalendarIcon />,
      color: "bg-pink-500",
      href: "/admin/school/academic-years",
    },
  ];

  const configCards = [
    {
      title: "Années Scolaires",
      description: "Gérer les années scolaires et périodes",
      icon: <CalendarIcon />,
      href: "/admin/school/academic-years",
    },
    {
      title: "Niveaux",
      description: "Gérer les niveaux scolaires",
      icon: <LevelIcon />,
      href: "/admin/school/levels",
    },
    {
      title: "Salles",
      description: "Gérer les salles et ressources",
      icon: <RoomIcon />,
      href: "/admin/school/rooms",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-lg text-muted-foreground">
          Bienvenue, <span className="font-semibold text-foreground">{session.user.firstName} {session.user.lastName}</span>
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
              <div className={`absolute top-0 right-0 h-20 w-20 ${stat.color} opacity-10 rounded-bl-full`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Configuration Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Configuration</h2>
          <p className="text-sm text-muted-foreground">Gérer les paramètres de l'école</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {configCards.map((config) => (
            <Link key={config.title} href={config.href}>
              <Card className="group transition-all duration-300 hover:shadow-md hover:border-primary/50 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {config.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{config.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Actions rapides</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/students">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <StudentIcon />
              <span className="ml-2">Gérer les élèves</span>
            </Button>
          </Link>
          <Link href="/admin/attendance">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <CalendarIcon />
              <span className="ml-2">Présences</span>
            </Button>
          </Link>
          <Link href="/admin/grades">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <SubjectIcon />
              <span className="ml-2">Notes</span>
            </Button>
          </Link>
          <Link href="/admin/report-cards">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <SubjectIcon />
              <span className="ml-2">Bulletins</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
