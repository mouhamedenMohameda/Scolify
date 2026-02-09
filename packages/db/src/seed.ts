/**
 * Database seed script
 * Creates comprehensive sample data for testing and marketing demos
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Hash password helper (same as in apps/web/lib/password.ts)
async function hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(password, SALT_ROUNDS);
}

const prisma = new PrismaClient();

// Helper function to generate matricule
function generateMatricule(year: string, index: number): string {
  const yearShort = year.substring(2, 4);
  return `${yearShort}${String(index).padStart(4, "0")}`;
}

async function main() {
  console.log("🌱 Seeding database with comprehensive test data...");

  // Create a test school
  const school = await prisma.school.upsert({
    where: { slug: "test-school" },
    update: {},
    create: {
      name: "École Primaire et Collège Excellence",
      slug: "test-school",
      email: "contact@excellence-school.fr",
      phone: "+33123456789",
      address: "123 Avenue de la République",
      city: "Paris",
      country: "FR",
      subscriptionPlan: "PREMIUM",
    },
  });

  console.log("✅ School created:", school.name);

  // Create roles
  const roles = [
    { code: "SCHOOL_ADMIN", name: "Administrateur", description: "Administrateur de l'école" },
    { code: "TEACHER", name: "Professeur", description: "Professeur" },
    { code: "SECRETARY", name: "Secrétaire", description: "Secrétaire" },
  ];

  const createdRoles: Record<string, any> = {};
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { code: roleData.code },
      update: {},
      create: {
        ...roleData,
        isSystem: true,
        schoolId: null, // System roles
      },
    });
    createdRoles[roleData.code] = role;
    console.log(`✅ Role created: ${role.name}`);
  }

  // Create academic year (check if exists first)
  let academicYear = await prisma.academicYear.findFirst({
    where: {
      schoolId: school.id,
      name: "2024-2025",
    },
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        schoolId: school.id,
        name: "2024-2025",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2025-06-30"),
        isActive: true,
      },
    });
  }

  console.log("✅ Academic year created:", academicYear.name);

  // Create periods
  const periods = [
    {
      name: "Trimestre 1",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2024-12-20"),
      order: 1,
    },
    {
      name: "Trimestre 2",
      startDate: new Date("2025-01-06"),
      endDate: new Date("2025-03-28"),
      order: 2,
    },
    {
      name: "Trimestre 3",
      startDate: new Date("2025-04-07"),
      endDate: new Date("2025-06-30"),
      order: 3,
    },
  ];

  for (const periodData of periods) {
    const existing = await prisma.period.findFirst({
      where: {
        academicYearId: academicYear.id,
        name: periodData.name,
      },
    });

    if (!existing) {
      await prisma.period.create({
        data: {
          ...periodData,
          academicYearId: academicYear.id,
        },
      });
    }
  }

  console.log("✅ Periods created");

  // Create levels
  const levels = [
    { code: "CP", name: "Cours Préparatoire", order: 1 },
    { code: "CE1", name: "Cours Élémentaire 1", order: 2 },
    { code: "CE2", name: "Cours Élémentaire 2", order: 3 },
    { code: "CM1", name: "Cours Moyen 1", order: 4 },
    { code: "CM2", name: "Cours Moyen 2", order: 5 },
    { code: "6EME", name: "Sixième", order: 6 },
    { code: "5EME", name: "Cinquième", order: 7 },
    { code: "4EME", name: "Quatrième", order: 8 },
    { code: "3EME", name: "Troisième", order: 9 },
  ];

  const createdLevels: Record<string, any> = {};
  for (const levelData of levels) {
    const level = await prisma.level.upsert({
      where: {
        schoolId_code: {
          schoolId: school.id,
          code: levelData.code,
        },
      },
      update: {},
      create: {
        ...levelData,
        schoolId: school.id,
      },
    });
    createdLevels[levelData.code] = level;
  }

  console.log("✅ Levels created");

  // Create rooms
  const rooms = [
    { name: "Salle 101", code: "S101", capacity: 30, type: "CLASSROOM" },
    { name: "Salle 102", code: "S102", capacity: 30, type: "CLASSROOM" },
    { name: "Salle 201", code: "S201", capacity: 30, type: "CLASSROOM" },
    { name: "Salle 202", code: "S202", capacity: 30, type: "CLASSROOM" },
    { name: "Labo Sciences", code: "LAB1", capacity: 24, type: "LAB" },
    { name: "Salle Informatique", code: "INFO1", capacity: 20, type: "LAB" },
    { name: "Salle de Sport", code: "SPORT1", capacity: 40, type: "GYM" },
  ];

  for (const roomData of rooms) {
    const existing = await prisma.room.findFirst({
      where: {
        schoolId: school.id,
        name: roomData.name,
      },
    });

    if (!existing) {
      await prisma.room.create({
        data: {
          ...roomData,
          schoolId: school.id,
        },
      });
    }
  }

  console.log("✅ Rooms created");

  // Create subjects
  const subjects = [
    { code: "FR", name: "Français", color: "#FF5733" },
    { code: "MATH", name: "Mathématiques", color: "#33C3F0" },
    { code: "ENG", name: "Anglais", color: "#33FF57" },
    { code: "HIST", name: "Histoire", color: "#FF33F0" },
    { code: "GEO", name: "Géographie", color: "#F0FF33" },
    { code: "SCI", name: "Sciences", color: "#33FFF0" },
    { code: "SPORT", name: "Éducation Physique", color: "#FF8C33" },
    { code: "ART", name: "Arts Plastiques", color: "#8C33FF" },
  ];

  const createdSubjects: Record<string, any> = {};
  for (const subjectData of subjects) {
    const subject = await prisma.subject.upsert({
      where: {
        schoolId_code: {
          schoolId: school.id,
          code: subjectData.code,
        },
      },
      update: {},
      create: {
        ...subjectData,
        schoolId: school.id,
      },
    });
    createdSubjects[subjectData.code] = subject;
  }

  console.log("✅ Subjects created");

  // Create users and teachers
  const teachersData = [
    {
      email: "marie.dupont@excellence-school.fr",
      firstName: "Marie",
      lastName: "Dupont",
      phone: "+33612345678",
      employeeNumber: "EMP001",
      contractType: "FULL_TIME",
    },
    {
      email: "jean.martin@excellence-school.fr",
      firstName: "Jean",
      lastName: "Martin",
      phone: "+33612345679",
      employeeNumber: "EMP002",
      contractType: "FULL_TIME",
    },
    {
      email: "sophie.bernard@excellence-school.fr",
      firstName: "Sophie",
      lastName: "Bernard",
      phone: "+33612345680",
      employeeNumber: "EMP003",
      contractType: "FULL_TIME",
    },
    {
      email: "pierre.leroy@excellence-school.fr",
      firstName: "Pierre",
      lastName: "Leroy",
      phone: "+33612345681",
      employeeNumber: "EMP004",
      contractType: "FULL_TIME",
    },
    {
      email: "isabelle.moreau@excellence-school.fr",
      firstName: "Isabelle",
      lastName: "Moreau",
      phone: "+33612345682",
      employeeNumber: "EMP005",
      contractType: "PART_TIME",
    },
  ];

  const createdTeachers: any[] = [];
  const passwordHash = await hashPassword("Test123456");

  for (const teacherData of teachersData) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: teacherData.email },
      update: {},
      create: {
        email: teacherData.email,
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        phone: teacherData.phone,
        passwordHash,
        emailVerified: true,
        isActive: true,
      },
    });

    // Create membership
    await prisma.membership.upsert({
      where: {
        userId_schoolId: {
          userId: user.id,
          schoolId: school.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        schoolId: school.id,
        roleId: createdRoles.TEACHER.id,
        isActive: true,
        joinedAt: new Date(),
      },
    });

    // Create teacher
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        schoolId: school.id,
        userId: user.id,
        employeeNumber: teacherData.employeeNumber,
        contractType: teacherData.contractType,
        hireDate: new Date("2023-09-01"),
      },
    });

    createdTeachers.push(teacher);
    console.log(`✅ Teacher created: ${teacherData.firstName} ${teacherData.lastName}`);
  }

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@excellence-school.fr" },
    update: {},
    create: {
      email: "admin@excellence-school.fr",
      firstName: "Admin",
      lastName: "Principal",
      phone: "+33612345600",
      passwordHash,
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_schoolId: {
        userId: adminUser.id,
        schoolId: school.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      schoolId: school.id,
      roleId: createdRoles.SCHOOL_ADMIN.id,
      isActive: true,
      joinedAt: new Date(),
    },
  });

  console.log("✅ Admin user created");

  // Note: To see the seeded data, you need to log in with:
  // Email: admin@excellence-school.fr
  // Password: Test123456
  // Or associate your current user account to this school manually

  // Create classes
  const classesData = [
    { name: "6ème A", code: "6A", levelCode: "6EME", teacherIndex: 0 },
    { name: "6ème B", code: "6B", levelCode: "6EME", teacherIndex: 1 },
    { name: "5ème A", code: "5A", levelCode: "5EME", teacherIndex: 2 },
    { name: "5ème B", code: "5B", levelCode: "5EME", teacherIndex: 3 },
    { name: "CM2 A", code: "CM2A", levelCode: "CM2", teacherIndex: 4 },
    { name: "CM1 A", code: "CM1A", levelCode: "CM1", teacherIndex: 0 },
  ];

  const createdClasses: any[] = [];
  for (const classData of classesData) {
    const level = createdLevels[classData.levelCode];
    if (!level) continue;

    const classEntity = await prisma.class.upsert({
      where: {
        schoolId_academicYearId_name: {
          schoolId: school.id,
          academicYearId: academicYear.id,
          name: classData.name,
        },
      },
      update: {},
      create: {
        name: classData.name,
        code: classData.code,
        capacity: 30,
        schoolId: school.id,
        academicYearId: academicYear.id,
        levelId: level.id,
        principalTeacherId: createdTeachers[classData.teacherIndex]?.id,
      },
    });

    createdClasses.push(classEntity);
    console.log(`✅ Class created: ${classData.name}`);
  }

  // Create students
  const studentsData = [
    // 6ème A students
    { firstName: "Lucas", lastName: "Martin", gender: "M", classIndex: 0, dateOfBirth: new Date("2012-05-15") },
    { firstName: "Emma", lastName: "Dubois", gender: "F", classIndex: 0, dateOfBirth: new Date("2012-07-22") },
    { firstName: "Hugo", lastName: "Bernard", gender: "M", classIndex: 0, dateOfBirth: new Date("2012-03-10") },
    { firstName: "Léa", lastName: "Petit", gender: "F", classIndex: 0, dateOfBirth: new Date("2012-09-05") },
    { firstName: "Nathan", lastName: "Robert", gender: "M", classIndex: 0, dateOfBirth: new Date("2012-11-18") },
    { firstName: "Chloé", lastName: "Richard", gender: "F", classIndex: 0, dateOfBirth: new Date("2012-01-25") },
    { firstName: "Thomas", lastName: "Durand", gender: "M", classIndex: 0, dateOfBirth: new Date("2012-08-12") },
    { firstName: "Manon", lastName: "Leroy", gender: "F", classIndex: 0, dateOfBirth: new Date("2012-04-30") },
    { firstName: "Alexandre", lastName: "Moreau", gender: "M", classIndex: 0, dateOfBirth: new Date("2012-06-08") },
    { firstName: "Camille", lastName: "Simon", gender: "F", classIndex: 0, dateOfBirth: new Date("2012-10-14") },
    // 6ème B students
    { firstName: "Louis", lastName: "Laurent", gender: "M", classIndex: 1, dateOfBirth: new Date("2012-02-20") },
    { firstName: "Sarah", lastName: "Lefebvre", gender: "F", classIndex: 1, dateOfBirth: new Date("2012-12-03") },
    { firstName: "Antoine", lastName: "Michel", gender: "M", classIndex: 1, dateOfBirth: new Date("2012-05-17") },
    { firstName: "Julie", lastName: "Garcia", gender: "F", classIndex: 1, dateOfBirth: new Date("2012-09-11") },
    { firstName: "Maxime", lastName: "David", gender: "M", classIndex: 1, dateOfBirth: new Date("2012-07-28") },
    { firstName: "Marine", lastName: "Bertrand", gender: "F", classIndex: 1, dateOfBirth: new Date("2012-03-15") },
    { firstName: "Romain", lastName: "Roux", gender: "M", classIndex: 1, dateOfBirth: new Date("2012-11-22") },
    { firstName: "Pauline", lastName: "Vincent", gender: "F", classIndex: 1, dateOfBirth: new Date("2012-01-08") },
    // 5ème A students
    { firstName: "Mathis", lastName: "Fournier", gender: "M", classIndex: 2, dateOfBirth: new Date("2011-04-12") },
    { firstName: "Inès", lastName: "Girard", gender: "F", classIndex: 2, dateOfBirth: new Date("2011-08-25") },
    { firstName: "Enzo", lastName: "Bonnet", gender: "M", classIndex: 2, dateOfBirth: new Date("2011-06-19") },
    { firstName: "Léna", lastName: "Dupuis", gender: "F", classIndex: 2, dateOfBirth: new Date("2011-10-07") },
    { firstName: "Noah", lastName: "Lambert", gender: "M", classIndex: 2, dateOfBirth: new Date("2011-02-14") },
    { firstName: "Lola", lastName: "Bonnet", gender: "F", classIndex: 2, dateOfBirth: new Date("2011-12-30") },
    // 5ème B students
    { firstName: "Ethan", lastName: "François", gender: "M", classIndex: 3, dateOfBirth: new Date("2011-05-21") },
    { firstName: "Zoé", lastName: "Martinez", gender: "F", classIndex: 3, dateOfBirth: new Date("2011-09-13") },
    { firstName: "Lucas", lastName: "Boyer", gender: "M", classIndex: 3, dateOfBirth: new Date("2011-07-04") },
    { firstName: "Élise", lastName: "Garnier", gender: "F", classIndex: 3, dateOfBirth: new Date("2011-03-27") },
    { firstName: "Jules", lastName: "Rousseau", gender: "M", classIndex: 3, dateOfBirth: new Date("2011-11-16") },
    // CM2 A students
    { firstName: "Liam", lastName: "Joly", gender: "M", classIndex: 4, dateOfBirth: new Date("2013-06-09") },
    { firstName: "Rose", lastName: "Gautier", gender: "F", classIndex: 4, dateOfBirth: new Date("2013-08-23") },
    { firstName: "Gabriel", lastName: "Perez", gender: "M", classIndex: 4, dateOfBirth: new Date("2013-04-16") },
    { firstName: "Mia", lastName: "Sanchez", gender: "F", classIndex: 4, dateOfBirth: new Date("2013-10-02") },
    { firstName: "Raphaël", lastName: "Morin", gender: "M", classIndex: 4, dateOfBirth: new Date("2013-02-28") },
    { firstName: "Lilou", lastName: "Nicolas", gender: "F", classIndex: 4, dateOfBirth: new Date("2013-12-11") },
    // CM1 A students
    { firstName: "Adam", lastName: "Henry", gender: "M", classIndex: 5, dateOfBirth: new Date("2014-05-14") },
    { firstName: "Luna", lastName: "Roussel", gender: "F", classIndex: 5, dateOfBirth: new Date("2014-07-31") },
    { firstName: "Maël", lastName: "Mathieu", gender: "M", classIndex: 5, dateOfBirth: new Date("2014-09-18") },
    { firstName: "Anna", lastName: "Gaultier", gender: "F", classIndex: 5, dateOfBirth: new Date("2014-03-25") },
    { firstName: "Noé", lastName: "Masson", gender: "M", classIndex: 5, dateOfBirth: new Date("2014-11-07") },
  ];

  let studentIndex = 1;
  const createdStudents: any[] = [];

  for (const studentData of studentsData) {
    const classEntity = createdClasses[studentData.classIndex];
    if (!classEntity) continue;

    const matricule = generateMatricule("2024", studentIndex++);
    
    // Check if student already exists
    let student = await prisma.student.findUnique({
      where: { matricule },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          schoolId: school.id,
          matricule,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender,
          status: "ENROLLED",
          enrollmentDate: new Date("2024-09-01"),
          address: `${Math.floor(Math.random() * 200) + 1} Rue de Paris`,
          city: "Paris",
          postalCode: "7500" + Math.floor(Math.random() * 20),
        },
      });
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        academicYearId: academicYear.id,
        classId: classEntity.id,
      },
    });

    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          academicYearId: academicYear.id,
          classId: classEntity.id,
          startDate: new Date("2024-09-01"),
          status: "ACTIVE",
        },
      });
    }

    createdStudents.push(student);
  }

  console.log(`✅ Created ${createdStudents.length} students`);

  // Create teacher assignments
  const assignments = [
    { teacherIndex: 0, classIndex: 0, subjectCode: "FR" },
    { teacherIndex: 0, classIndex: 0, subjectCode: "HIST" },
    { teacherIndex: 1, classIndex: 1, subjectCode: "MATH" },
    { teacherIndex: 1, classIndex: 1, subjectCode: "SCI" },
    { teacherIndex: 2, classIndex: 2, subjectCode: "FR" },
    { teacherIndex: 2, classIndex: 2, subjectCode: "GEO" },
    { teacherIndex: 3, classIndex: 3, subjectCode: "MATH" },
    { teacherIndex: 3, classIndex: 3, subjectCode: "ENG" },
    { teacherIndex: 4, classIndex: 4, subjectCode: "FR" },
    { teacherIndex: 4, classIndex: 4, subjectCode: "MATH" },
    { teacherIndex: 0, classIndex: 5, subjectCode: "FR" },
    { teacherIndex: 0, classIndex: 5, subjectCode: "SCI" },
  ];

  for (const assignment of assignments) {
    const teacher = createdTeachers[assignment.teacherIndex];
    const classEntity = createdClasses[assignment.classIndex];
    const subject = createdSubjects[assignment.subjectCode];

    if (teacher && classEntity && subject) {
      const existing = await prisma.teacherAssignment.findFirst({
        where: {
          teacherId: teacher.id,
          classId: classEntity.id,
          subjectId: subject.id,
          academicYearId: academicYear.id,
        },
      });

      if (!existing) {
        await prisma.teacherAssignment.create({
          data: {
            teacherId: teacher.id,
            classId: classEntity.id,
            subjectId: subject.id,
            academicYearId: academicYear.id,
            hoursPerWeek: 4,
          },
        });
      }
    }
  }

  console.log("✅ Teacher assignments created");

  // Create Timetable
  let timetable = await prisma.timetable.findFirst({
    where: {
      schoolId: school.id,
      academicYearId: academicYear.id,
    },
  });

  if (!timetable) {
    timetable = await prisma.timetable.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        name: `Emploi du temps ${academicYear.name}`,
        isActive: true,
      },
    });
  } else {
    timetable = await prisma.timetable.update({
      where: { id: timetable.id },
      data: { isActive: true },
    });
  }

  console.log("✅ Timetable created");

  // Create Timetable Slots for each class
  const timeSlots = [
    { day: 0, start: "08:00", end: "09:00" }, // Monday
    { day: 0, start: "09:00", end: "10:00" },
    { day: 0, start: "10:15", end: "11:15" },
    { day: 0, start: "11:15", end: "12:15" },
    { day: 0, start: "14:00", end: "15:00" },
    { day: 0, start: "15:00", end: "16:00" },
    { day: 1, start: "08:00", end: "09:00" }, // Tuesday
    { day: 1, start: "09:00", end: "10:00" },
    { day: 1, start: "10:15", end: "11:15" },
    { day: 1, start: "11:15", end: "12:15" },
    { day: 1, start: "14:00", end: "15:00" },
    { day: 2, start: "08:00", end: "09:00" }, // Wednesday
    { day: 2, start: "09:00", end: "10:00" },
    { day: 2, start: "10:15", end: "11:15" },
    { day: 3, start: "08:00", end: "09:00" }, // Thursday
    { day: 3, start: "09:00", end: "10:00" },
    { day: 3, start: "10:15", end: "11:15" },
    { day: 3, start: "11:15", end: "12:15" },
    { day: 3, start: "14:00", end: "15:00" },
    { day: 4, start: "08:00", end: "09:00" }, // Friday
    { day: 4, start: "09:00", end: "10:00" },
    { day: 4, start: "10:15", end: "11:15" },
    { day: 4, start: "11:15", end: "12:15" },
  ];

  const subjectCodes = ["FR", "MATH", "ENG", "HIST", "GEO", "SCI", "SPORT", "ART"];
  const createdRooms = await prisma.room.findMany({ where: { schoolId: school.id } });

  for (let i = 0; i < Math.min(createdClasses.length, 3); i++) {
    const classEntity = createdClasses[i];
    const teacher = createdTeachers[i % createdTeachers.length];
    const room = createdRooms[i % createdRooms.length];

    for (let j = 0; j < Math.min(timeSlots.length, 8); j++) {
      const slot = timeSlots[j];
      const subjectCode = subjectCodes[j % subjectCodes.length];
      const subject = createdSubjects[subjectCode];

      if (subject && teacher && room) {
        await prisma.timetableSlot.create({
          data: {
            timetableId: timetable.id,
            classId: classEntity.id,
            subjectId: subject.id,
            teacherId: teacher.id,
            roomId: room.id,
            dayOfWeek: slot.day,
            startTime: slot.start,
            endTime: slot.end,
            weekPattern: "ALL",
          },
        });
      }
    }
  }

  console.log("✅ Timetable slots created");

  // Get timetable slots for attendance
  const timetableSlots = await prisma.timetableSlot.findMany({
    where: { timetableId: timetable.id },
    take: 5,
  });

  // Create Attendance Records for the last week (reduced for performance)
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  // Create attendance for 5 days only (optimized with batch creation)
  const attendanceRecordsToCreate = [];
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const d = new Date(oneWeekAgo);
    d.setDate(oneWeekAgo.getDate() + dayOffset);

    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // Convert to 0-6 (Mon-Sun)
    const slotsForDay = timetableSlots.filter((slot) => slot.dayOfWeek === dayOfWeek);

    for (const slot of slotsForDay.slice(0, 2)) {
      // Get students from the class (limit to 5 students per slot)
      const classEnrollments = await prisma.enrollment.findMany({
        where: { classId: slot.classId || undefined },
        include: { student: true },
        take: 5,
      });

      for (const enrollment of classEnrollments) {
        const student = enrollment.student;
        const statuses = ["PRESENT", "PRESENT", "PRESENT", "LATE", "ABSENT"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const attendanceDate = new Date(d);
        attendanceDate.setHours(8, 0, 0, 0);

        attendanceRecordsToCreate.push({
          studentId: student.id,
          timetableSlotId: slot.id,
          date: attendanceDate,
          status,
          arrivalTime: status === "LATE" ? new Date(attendanceDate.getTime() + (Math.floor(Math.random() * 30) + 1) * 60000) : null,
          minutesLate: status === "LATE" ? Math.floor(Math.random() * 30) + 1 : null,
        });
      }
    }
  }

  // Batch create attendance records
  if (attendanceRecordsToCreate.length > 0) {
    await prisma.attendanceRecord.createMany({
      data: attendanceRecordsToCreate,
      skipDuplicates: true,
    });
  }

  console.log("✅ Attendance records created");

  // Create Justifications (optimized with batch creation)
  const justificationReasons = [
    "Maladie avec certificat médical",
    "Rendez-vous médical",
    "Décès dans la famille",
    "Rendez-vous administratif",
    "Absence justifiée par les parents",
  ];

  const justificationsToCreate = [];
  for (let i = 0; i < 10; i++) {
    const student = createdStudents[Math.floor(Math.random() * createdStudents.length)];
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 14));
    date.setHours(0, 0, 0, 0);

    justificationsToCreate.push({
      studentId: student.id,
      date,
      reason: justificationReasons[Math.floor(Math.random() * justificationReasons.length)],
      status: Math.random() > 0.3 ? "APPROVED" : "PENDING",
      reviewedBy: Math.random() > 0.5 ? adminUser.id : null,
      reviewedAt: Math.random() > 0.5 ? new Date() : null,
    });
  }

  if (justificationsToCreate.length > 0) {
    await prisma.justification.createMany({
      data: justificationsToCreate,
      skipDuplicates: true,
    });
  }

  console.log("✅ Justifications created");

  // Get periods for assessments
  const dbPeriods = await prisma.period.findMany({
    where: { academicYearId: academicYear.id },
  });
  const firstPeriod = dbPeriods[0];

  // Create Assessments and Grades
  const assessmentTypes = ["TEST", "HOMEWORK", "PROJECT", "ORAL"];
  const assessmentNames = [
    "Contrôle de Mathématiques",
    "Devoir de Français",
    "Évaluation d'Anglais",
    "Projet de Sciences",
    "Interrogation d'Histoire",
    "Contrôle de Géographie",
    "Évaluation d'Éducation Physique",
  ];

  const createdAssessments: any[] = [];

  for (let i = 0; i < Math.min(createdClasses.length, 3); i++) {
    const classEntity = createdClasses[i];
    const teacher = createdTeachers[i % createdTeachers.length];

    for (let j = 0; j < 3; j++) {
      const subjectCode = Object.keys(createdSubjects)[j % Object.keys(createdSubjects).length];
      const subject = createdSubjects[subjectCode];

      if (subject && firstPeriod) {
        const assessmentName = `${assessmentNames[j % assessmentNames.length]} - ${classEntity.name}`;
        
        // Check if assessment already exists
        let assessment = await prisma.assessment.findFirst({
          where: {
            classId: classEntity.id,
            subjectId: subject.id,
            periodId: firstPeriod.id,
            name: assessmentName,
          },
        });

        if (!assessment) {
          assessment = await prisma.assessment.create({
            data: {
              schoolId: school.id,
              classId: classEntity.id,
              subjectId: subject.id,
              teacherId: teacher.id,
              periodId: firstPeriod.id,
              name: assessmentName,
              type: assessmentTypes[j % assessmentTypes.length],
              maxScore: 20,
              coefficient: j % 2 === 0 ? 1 : 2,
              date: new Date(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              isPublished: Math.random() > 0.2,
            },
          });
        }

        createdAssessments.push(assessment);

        // Create grades for students in this class (limit to 10 students per assessment)
        const classEnrollments = await prisma.enrollment.findMany({
          where: { classId: classEntity.id },
          include: { student: true },
          take: 10,
        });

        // Prepare grades for batch creation
        const gradesToCreate = [];
        for (const enrollment of classEnrollments) {
          const student = enrollment.student;
          
          // Check if grade already exists
          const existingGrade = await prisma.grade.findUnique({
            where: {
              studentId_assessmentId: {
                studentId: student.id,
                assessmentId: assessment.id,
              },
            },
          });

          if (!existingGrade) {
            const score = Math.floor(Math.random() * 20) + 1; // 1-20
            const comment = score >= 15 ? "Très bien" : score >= 10 ? "Bien" : score >= 5 ? "À améliorer" : "Insuffisant";

            gradesToCreate.push({
              studentId: student.id,
              assessmentId: assessment.id,
              score,
              comment: Math.random() > 0.5 ? comment : null,
            });
          }
        }

        // Batch create grades
        if (gradesToCreate.length > 0) {
          await prisma.grade.createMany({
            data: gradesToCreate,
            skipDuplicates: true,
          });
        }
      }
    }
  }

  console.log("✅ Assessments and grades created");

  // Create Report Cards for first period
  if (firstPeriod) {
    for (const enrollment of await prisma.enrollment.findMany({
      where: { academicYearId: academicYear.id },
      include: { student: true },
      take: 15,
    })) {
      const student = enrollment.student;
      
      // Check if report card already exists
      const existingReportCard = await prisma.reportCard.findUnique({
        where: {
          studentId_periodId: {
            studentId: student.id,
            periodId: firstPeriod.id,
          },
        },
      });

      if (!existingReportCard) {
        const overallAverage = Math.random() * 10 + 10; // 10-20
        const mentions = ["PASSABLE", "ASSEZ_BIEN", "BIEN", "TRES_BIEN"];
        const mention = overallAverage >= 16 ? "TRES_BIEN" : overallAverage >= 14 ? "BIEN" : overallAverage >= 12 ? "ASSEZ_BIEN" : "PASSABLE";

        const reportCard = await prisma.reportCard.create({
          data: {
            studentId: student.id,
            academicYearId: academicYear.id,
            periodId: firstPeriod.id,
            overallAverage,
            mention,
            status: Math.random() > 0.3 ? "PUBLISHED" : "GENERATED",
            generatedAt: new Date(),
            publishedAt: Math.random() > 0.3 ? new Date() : null,
          },
        });

        // Add comments for some subjects
        const subjectKeys = Object.keys(createdSubjects).slice(0, 3);
        for (const subjectCode of subjectKeys) {
          const subject = createdSubjects[subjectCode];
          const teacher = createdTeachers[Math.floor(Math.random() * createdTeachers.length)];

          if (subject && teacher && Math.random() > 0.5) {
            // Check if comment already exists
            const existingComment = await prisma.reportCardComment.findUnique({
              where: {
                reportCardId_subjectId: {
                  reportCardId: reportCard.id,
                  subjectId: subject.id,
                },
              },
            });

            if (!existingComment) {
              const comments = [
                "Élève sérieux et appliqué",
                "Bon travail, continuez ainsi",
                "Des efforts sont nécessaires",
                "Très bon niveau",
                "À améliorer dans cette matière",
              ];

              await prisma.reportCardComment.create({
                data: {
                  reportCardId: reportCard.id,
                  subjectId: subject.id,
                  teacherId: teacher.id,
                  comment: comments[Math.floor(Math.random() * comments.length)],
                },
              });
            }
          }
        }
      }
    }

    console.log("✅ Report cards created");
  }

  // Create Messages (simplified - only 1 thread)
  try {
    // Get user IDs from first teacher
    const firstTeacherUserId = createdTeachers[0]?.userId;
    if (firstTeacherUserId && adminUser) {
      const thread = await prisma.messageThread.create({
        data: {
          subject: "Réunion parents-professeurs",
          type: "GROUP",
        },
      });
      
      // Add participants
      await prisma.messageThreadParticipant.createMany({
        data: [
          { threadId: thread.id, userId: adminUser.id },
          { threadId: thread.id, userId: firstTeacherUserId },
        ],
        skipDuplicates: true,
      });

      // Add 1 message
      await prisma.message.create({
        data: {
          threadId: thread.id,
          senderId: adminUser.id,
          content: "Bonjour, je souhaite organiser une réunion pour discuter du projet pédagogique.",
          isRead: false,
        },
      });
    }
    console.log("✅ Messages created");
  } catch (error) {
    console.log("⚠️  Messages creation skipped:", error);
  }

  // Create Announcements
  const announcements = [
    {
      title: "Réunion parents-professeurs",
      content: "La réunion parents-professeurs aura lieu le vendredi 15 novembre à 18h00. Tous les parents sont invités.",
      type: "GENERAL",
      targetAudience: ["ALL"],
    },
    {
      title: "Sortie scolaire au musée",
      content: "Les classes de 6ème participeront à une sortie au musée d'histoire le 20 novembre. Autorisation parentale requise.",
      type: "INFO",
      targetAudience: ["STUDENTS", "PARENTS"],
    },
    {
      title: "Rappel : Absences",
      content: "N'oubliez pas de justifier les absences de vos enfants dans les 48 heures suivant leur retour.",
      type: "URGENT",
      targetAudience: ["PARENTS"],
    },
    {
      title: "Nouveau système de notes",
      content: "Le nouveau système de notation est maintenant disponible. Vous pouvez consulter les notes de vos enfants en ligne.",
      type: "INFO",
      targetAudience: ["PARENTS", "STUDENTS"],
    },
  ];

  for (const announcementData of announcements) {
    await prisma.announcement.create({
      data: {
        schoolId: school.id,
        title: announcementData.title,
        content: announcementData.content,
        type: announcementData.type as any,
        targetAudience: announcementData.targetAudience,
        publishDate: new Date(today.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("✅ Announcements created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - School: ${school.name}`);
  console.log(`   - Academic Year: ${academicYear.name}`);
  console.log(`   - Levels: ${Object.keys(createdLevels).length}`);
  console.log(`   - Classes: ${createdClasses.length}`);
  console.log(`   - Teachers: ${createdTeachers.length}`);
  console.log(`   - Students: ${createdStudents.length}`);
  console.log(`   - Subjects: ${Object.keys(createdSubjects).length}`);
  console.log(`   - Rooms: ${rooms.length}`);
  console.log(`   - Timetable Slots: ${timetableSlots.length}`);
  console.log(`   - Assessments: ${createdAssessments.length}`);
  console.log(`   - Announcements: ${announcements.length}`);
  console.log("\n🔑 Test Accounts:");
  console.log(`   - Admin: admin@excellence-school.fr / Test123456`);
  console.log(`   - Teacher: marie.dupont@excellence-school.fr / Test123456`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
