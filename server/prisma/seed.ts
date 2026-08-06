import { PrismaClient, RoleEnum, DayOfWeekEnum, CounterStatusEnum, PriorityLevelEnum } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting QueueFlow database seeding...');

  const defaultPassword = await bcrypt.hash('Password123!', SALT_ROUNDS);

  // 1. Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@queueflow.com' },
    update: {},
    create: {
      email: 'superadmin@queueflow.com',
      password: defaultPassword,
      fullName: 'Global System Administrator',
      phone: '+18005550100',
      role: RoleEnum.SUPER_ADMIN,
    },
  });
  console.log(`✅ Super Admin created/verified: ${superAdmin.email}`);

  // 2. Organization
  const org = await prisma.organization.upsert({
    where: { code: 'METROHEALTH' },
    update: {},
    create: {
      name: 'Metro Health Medical Center',
      code: 'METROHEALTH',
      description: 'Premier Multi-Specialty Healthcare & Digital Clinic Network',
      logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
    },
  });
  console.log(`✅ Organization created/verified: ${org.name} (${org.code})`);

  // 3. Organization Settings
  await prisma.organizationSetting.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      maxTokensPerDay: 1000,
      autoCallEnabled: true,
      smsGatewayEnabled: true,
      themeColor: '#0c8ce9',
      customConfig: JSON.stringify({ welcomeMessage: 'Welcome to Metro Health Queue System' }),
    },
  });
  console.log(`✅ Organization Settings configured for ${org.name}`);

  // 4. Branch
  const branch = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: org.id,
        code: 'CENTRAL',
      },
    },
    update: {},
    create: {
      name: 'Central General Hospital Branch',
      code: 'CENTRAL',
      organizationId: org.id,
      address: '742 Evergreen Terrace, Medical District, Sector 4',
      phone: '+18005550199',
      timeZone: 'America/New_York',
    },
  });
  console.log(`✅ Branch created/verified: ${branch.name}`);

  // 5. Working Hours (Monday–Saturday Open 08:00–17:00, Sunday Closed)
  const days: { day: DayOfWeekEnum; isClosed: boolean }[] = [
    { day: DayOfWeekEnum.MONDAY, isClosed: false },
    { day: DayOfWeekEnum.TUESDAY, isClosed: false },
    { day: DayOfWeekEnum.WEDNESDAY, isClosed: false },
    { day: DayOfWeekEnum.THURSDAY, isClosed: false },
    { day: DayOfWeekEnum.FRIDAY, isClosed: false },
    { day: DayOfWeekEnum.SATURDAY, isClosed: false },
    { day: DayOfWeekEnum.SUNDAY, isClosed: true },
  ];

  for (const item of days) {
    await prisma.workingHour.upsert({
      where: {
        branchId_dayOfWeek: {
          branchId: branch.id,
          dayOfWeek: item.day,
        },
      },
      update: {
        isClosed: item.isClosed,
      },
      create: {
        branchId: branch.id,
        dayOfWeek: item.day,
        openTime: '08:00',
        closeTime: '17:00',
        lunchStartTime: '12:00',
        lunchEndTime: '13:00',
        isClosed: item.isClosed,
      },
    });
  }
  console.log(`✅ Working Hours configured (Mon–Sat Open, Sun Closed)`);

  // 6. Holiday
  const holidayDate = new Date('2026-12-25');
  const existingHoliday = await prisma.holiday.findFirst({
    where: { branchId: branch.id, date: holidayDate },
  });

  if (!existingHoliday) {
    await prisma.holiday.create({
      data: {
        branchId: branch.id,
        name: 'National Winter Holiday',
        date: holidayDate,
        description: 'Annual facility holiday closure',
      },
    });
  }
  console.log(`✅ Holiday configured: National Winter Holiday`);

  // 7. Organization Admin User
  const orgAdmin = await prisma.user.upsert({
    where: { email: 'admin@metrohealth.com' },
    update: {},
    create: {
      email: 'admin@metrohealth.com',
      password: defaultPassword,
      fullName: 'Dr. Robert Vance (Org Admin)',
      phone: '+18005550101',
      role: RoleEnum.ORG_ADMIN,
      organizationId: org.id,
    },
  });
  console.log(`✅ Organization Admin created/verified: ${orgAdmin.email}`);

  // 8. Department
  const dept = await prisma.department.upsert({
    where: {
      branchId_code: {
        branchId: branch.id,
        code: 'OUTPATIENT',
      },
    },
    update: {},
    create: {
      name: 'Outpatient Care Services',
      code: 'OUTPATIENT',
      description: 'General OPD registration, doctor consultations, and pharmacy dispensary',
      branchId: branch.id,
    },
  });
  console.log(`✅ Department created/verified: ${dept.name}`);

  // 9. Services (Registration, Consultation, Pharmacy)
  const serviceData = [
    { name: 'Patient Registration & Triage', code: 'REG', prefix: 'REG', avgTime: 5 },
    { name: 'General Doctor Consultation', code: 'CONSULT', prefix: 'DOC', avgTime: 15 },
    { name: 'Pharmacy & Prescriptions', code: 'PHARM', prefix: 'PHARM', avgTime: 8 },
  ];

  const services = [];
  for (const s of serviceData) {
    const service = await prisma.service.upsert({
      where: {
        departmentId_code: {
          departmentId: dept.id,
          code: s.code,
        },
      },
      update: {},
      create: {
        name: s.name,
        code: s.code,
        prefix: s.prefix,
        avgServiceTimeMins: s.avgTime,
        departmentId: dept.id,
      },
    });
    services.push(service);
  }
  console.log(`✅ 3 Services created/verified: Registration, Consultation, Pharmacy`);

  // 10. Counters (3 Counters)
  const countersData = [
    { number: 1, name: 'Counter 01 - Registration & Helpdesk', status: CounterStatusEnum.OPEN },
    { number: 2, name: 'Counter 02 - Doctor Consultation Room A', status: CounterStatusEnum.OPEN },
    { number: 3, name: 'Counter 03 - Pharmacy & Dispensary Desk', status: CounterStatusEnum.OPEN },
  ];

  const counters = [];
  for (const c of countersData) {
    const counter = await prisma.counter.upsert({
      where: {
        branchId_number: {
          branchId: branch.id,
          number: c.number,
        },
      },
      update: { status: c.status },
      create: {
        number: c.number,
        name: c.name,
        branchId: branch.id,
        status: c.status,
      },
    });
    counters.push(counter);
  }
  console.log(`✅ 3 Counters created/verified: Counter 01, Counter 02, Counter 03`);

  // Map Counters to Services via CounterService
  for (let i = 0; i < counters.length; i++) {
    await prisma.counterService.upsert({
      where: {
        counterId_serviceId: {
          counterId: counters[i].id,
          serviceId: services[i].id,
        },
      },
      update: {},
      create: {
        counterId: counters[i].id,
        serviceId: services[i].id,
      },
    });
  }
  console.log(`✅ Counter-to-Service mappings established`);

  // 11. Staff Users (2 Staff Members)
  const staffData = [
    { email: 'staff.john@metrohealth.com', fullName: 'John Doe (Registration Officer)', empId: 'EMP-101', counterId: counters[0].id },
    { email: 'staff.sarah@metrohealth.com', fullName: 'Dr. Sarah Connor (Consulting Physician)', empId: 'EMP-102', counterId: counters[1].id },
  ];

  for (const s of staffData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: defaultPassword,
        fullName: s.fullName,
        phone: '+18005550201',
        role: RoleEnum.STAFF,
        organizationId: org.id,
      },
    });

    await prisma.staffProfile.upsert({
      where: { userId: user.id },
      update: { counterId: s.counterId },
      create: {
        userId: user.id,
        organizationId: org.id,
        branchId: branch.id,
        departmentId: dept.id,
        counterId: s.counterId,
        employeeId: s.empId,
      },
    });
  }
  console.log(`✅ 2 Staff Users created/verified with counter assignments`);

  // 12. Customer Users (5 Customers)
  const customerData = [
    { email: 'customer1@gmail.com', fullName: 'Alice Smith', phone: '+1555019001' },
    { email: 'customer2@gmail.com', fullName: 'Bob Johnson', phone: '+1555019002' },
    { email: 'customer3@gmail.com', fullName: 'Carol Williams', phone: '+1555019003' },
    { email: 'customer4@gmail.com', fullName: 'David Miller', phone: '+1555019004' },
    { email: 'customer5@gmail.com', fullName: 'Eva Davis', phone: '+1555019005' },
  ];

  for (const cust of customerData) {
    const customer = await prisma.user.upsert({
      where: { email: cust.email },
      update: {},
      create: {
        email: cust.email,
        password: defaultPassword,
        fullName: cust.fullName,
        phone: cust.phone,
        role: RoleEnum.CUSTOMER,
      },
    });
  }
  console.log(`✅ 5 Customer Users created/verified`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
