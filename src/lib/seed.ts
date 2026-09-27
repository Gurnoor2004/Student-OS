import { db } from './storage';
import { generateId, SUBJECT_COLORS } from './utils';

export function seedPrototypeData(userId: string) {
  if (db.seeded.has(userId)) return;

  const subjects = [
    { name: 'Data Structures & Algorithms', code: 'CS301', teacher: 'Dr. Priya Sharma', room: 'A-201', credits: 4, color: SUBJECT_COLORS[0] },
    { name: 'Operating Systems', code: 'CS302', teacher: 'Prof. Rahul Mehta', room: 'B-105', credits: 4, color: SUBJECT_COLORS[1] },
    { name: 'Computer Networks', code: 'CS303', teacher: 'Dr. Anita Joshi', room: 'A-301', credits: 3, color: SUBJECT_COLORS[2] },
    { name: 'Database Management Systems', code: 'CS304', teacher: 'Prof. Suresh Kumar', room: 'C-102', credits: 4, color: SUBJECT_COLORS[3] },
    { name: 'Engineering Mathematics III', code: 'MA301', teacher: 'Dr. Kavya Nair', room: 'D-001', credits: 3, color: SUBJECT_COLORS[4] },
    { name: 'Software Engineering', code: 'CS305', teacher: 'Prof. Deepak Patel', room: 'B-202', credits: 3, color: SUBJECT_COLORS[5] },
  ].map((s) => db.subjects.create({ ...s, userId, semester: 5 }));

  const [dsa, os, cn, dbms, math, se] = subjects;

  // Timetable: Mon–Sat schedule
  const entries = [
    // Monday
    { subjectId: dsa.id, day: 1, startTime: '09:00', endTime: '10:00', room: 'A-201', teacher: dsa.teacher },
    { subjectId: os.id, day: 1, startTime: '10:15', endTime: '11:15', room: 'B-105', teacher: os.teacher },
    { subjectId: math.id, day: 1, startTime: '13:00', endTime: '14:00', room: 'D-001', teacher: math.teacher },
    // Tuesday
    { subjectId: cn.id, day: 2, startTime: '09:00', endTime: '10:00', room: 'A-301', teacher: cn.teacher },
    { subjectId: dbms.id, day: 2, startTime: '10:15', endTime: '11:15', room: 'C-102', teacher: dbms.teacher },
    { subjectId: se.id, day: 2, startTime: '14:00', endTime: '15:00', room: 'B-202', teacher: se.teacher },
    // Wednesday
    { subjectId: dsa.id, day: 3, startTime: '09:00', endTime: '10:00', room: 'A-201', teacher: dsa.teacher },
    { subjectId: math.id, day: 3, startTime: '10:15', endTime: '11:15', room: 'D-001', teacher: math.teacher },
    { subjectId: os.id, day: 3, startTime: '13:00', endTime: '15:00', room: 'Lab-1', teacher: os.teacher },
    // Thursday
    { subjectId: cn.id, day: 4, startTime: '09:00', endTime: '10:00', room: 'A-301', teacher: cn.teacher },
    { subjectId: dbms.id, day: 4, startTime: '10:15', endTime: '12:15', room: 'Lab-2', teacher: dbms.teacher },
    { subjectId: se.id, day: 4, startTime: '14:00', endTime: '15:00', room: 'B-202', teacher: se.teacher },
    // Friday
    { subjectId: dsa.id, day: 5, startTime: '09:00', endTime: '10:00', room: 'A-201', teacher: dsa.teacher },
    { subjectId: os.id, day: 5, startTime: '10:15', endTime: '11:15', room: 'B-105', teacher: os.teacher },
    { subjectId: math.id, day: 5, startTime: '13:00', endTime: '14:00', room: 'D-001', teacher: math.teacher },
    { subjectId: cn.id, day: 5, startTime: '14:15', endTime: '15:15', room: 'A-301', teacher: cn.teacher },
    // Saturday
    { subjectId: dbms.id, day: 6, startTime: '10:00', endTime: '11:00', room: 'C-102', teacher: dbms.teacher },
    { subjectId: se.id, day: 6, startTime: '11:15', endTime: '12:15', room: 'B-202', teacher: se.teacher },
  ] as const;

  for (const e of entries) {
    db.timetable.create({ ...e, day: e.day as 0|1|2|3|4|5|6, userId });
  }

  // Attendance: past 30 days with realistic patterns
  // DSA: 85%, OS: 70%, CN: 62% (warning), DBMS: 80%, Math: 90%, SE: 75%
  const attendancePatterns: Record<string, { days: number[]; absentDates: string[] }> = {
    [dsa.id]: { days: [1, 3, 5], absentDates: ['2026-09-02', '2026-09-16'] },
    [os.id]: { days: [1, 3, 5], absentDates: ['2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21'] },
    [cn.id]: { days: [2, 4, 5], absentDates: ['2026-08-30', '2026-09-06', '2026-09-13', '2026-09-20', '2026-09-24'] },
    [dbms.id]: { days: [2, 4, 6], absentDates: ['2026-09-05', '2026-09-19'] },
    [math.id]: { days: [1, 3, 5], absentDates: [] },
    [se.id]: { days: [2, 4, 6], absentDates: ['2026-09-08', '2026-09-22'] },
  };

  const startDate = new Date('2026-08-28');
  const endDate = new Date('2026-09-26');

  for (const [subId, { days, absentDates }] of Object.entries(attendancePatterns)) {
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dow = cur.getDay();
      if (days.includes(dow)) {
        const dateStr = cur.toISOString().split('T')[0];
        const isAbsent = absentDates.includes(dateStr);
        db.attendance.create({
          userId,
          subjectId: subId,
          date: dateStr,
          status: isAbsent ? 'absent' : 'present',
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  // Assignments
  const assignmentSeed = [
    {
      subjectId: dsa.id,
      title: '[PROTOTYPE] Assignment 3: Graph Algorithms',
      description: 'Implement BFS, DFS, and Dijkstra\'s algorithm. Submit source code and analysis.',
      dueDate: '2026-10-01',
      priority: 'high' as const,
      status: 'in_progress' as const,
    },
    {
      subjectId: os.id,
      title: '[PROTOTYPE] Lab Report: Process Scheduling',
      description: 'Write a detailed report comparing FCFS, SJF, and Round Robin scheduling.',
      dueDate: '2026-09-28',
      priority: 'high' as const,
      status: 'not_started' as const,
    },
    {
      subjectId: cn.id,
      title: '[PROTOTYPE] Assignment 2: TCP/IP Protocol Analysis',
      description: 'Analyze TCP handshake and implement a basic socket program.',
      dueDate: '2026-09-20',
      priority: 'medium' as const,
      status: 'overdue' as const,
    },
    {
      subjectId: dbms.id,
      title: '[PROTOTYPE] Mini Project: Library Management DB',
      description: 'Design ER diagram, normalize to 3NF, and implement SQL queries.',
      dueDate: '2026-10-07',
      priority: 'high' as const,
      status: 'in_progress' as const,
    },
    {
      subjectId: math.id,
      title: '[PROTOTYPE] Tutorial Sheet 4: Differential Equations',
      description: 'Solve problems 1–15 from Tutorial Sheet 4.',
      dueDate: '2026-09-30',
      priority: 'medium' as const,
      status: 'not_started' as const,
    },
    {
      subjectId: se.id,
      title: '[PROTOTYPE] SRS Document: Team Project',
      description: 'Write Software Requirements Specification for the semester project.',
      dueDate: '2026-10-05',
      priority: 'medium' as const,
      status: 'submitted' as const,
    },
  ];

  for (const a of assignmentSeed) {
    db.assignments.create({ ...a, userId, attachmentUrl: '' });
  }

  // Exams
  const examSeed = [
    {
      subjectId: dsa.id,
      title: '[PROTOTYPE] DSA Mid-Semester Examination',
      examType: 'midterm' as const,
      date: '2026-10-10',
      time: '09:00',
      venue: 'Exam Hall A',
      syllabus: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching',
      preparationStatus: 'in_progress' as const,
    },
    {
      subjectId: os.id,
      title: '[PROTOTYPE] OS Internal Examination',
      examType: 'internal' as const,
      date: '2026-10-15',
      time: '10:30',
      venue: 'B-105',
      syllabus: 'Process Management, Memory Management, File Systems',
      preparationStatus: 'not_started' as const,
    },
    {
      subjectId: math.id,
      title: '[PROTOTYPE] Mathematics III Mid-Semester',
      examType: 'midterm' as const,
      date: '2026-10-12',
      time: '14:00',
      venue: 'Exam Hall B',
      syllabus: 'ODE, PDE, Laplace Transforms, Fourier Series',
      preparationStatus: 'not_started' as const,
    },
    {
      subjectId: dbms.id,
      title: '[PROTOTYPE] DBMS Quiz 2',
      examType: 'quiz' as const,
      date: '2026-10-03',
      time: '09:00',
      venue: 'C-102',
      syllabus: 'Normalization, SQL Joins, Transactions',
      preparationStatus: 'not_started' as const,
    },
  ];

  for (const e of examSeed) {
    db.exams.create({ ...e, userId });
  }

  // Tasks
  const taskSeed = [
    {
      title: '[PROTOTYPE] Prepare for DSA exam — revise graphs',
      category: 'academic' as const,
      priority: 'high' as const,
      status: 'pending' as const,
      dueDate: '2026-10-08',
      description: 'Focus on Dijkstra, Prim, and Kruskal algorithms',
    },
    {
      title: '[PROTOTYPE] Apply to Google Summer of Code',
      category: 'career' as const,
      priority: 'high' as const,
      status: 'pending' as const,
      dueDate: '2026-10-01',
    },
    {
      title: '[PROTOTYPE] Update resume with internship',
      category: 'career' as const,
      priority: 'medium' as const,
      status: 'pending' as const,
    },
    {
      title: '[PROTOTYPE] Submit college fee — Semester 5',
      category: 'college' as const,
      priority: 'high' as const,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
    },
    {
      title: '[PROTOTYPE] Read research paper on distributed systems',
      category: 'academic' as const,
      priority: 'low' as const,
      status: 'pending' as const,
    },
    {
      title: '[PROTOTYPE] Register for HackIndia hackathon',
      category: 'projects' as const,
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: '2026-09-30',
    },
    {
      title: '[PROTOTYPE] Attend GDSC introductory session',
      category: 'college' as const,
      priority: 'low' as const,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
    },
  ];

  for (const t of taskSeed) {
    db.tasks.create({ ...t, userId });
  }

  // Notes
  db.notes.create({
    userId,
    subjectId: dsa.id,
    title: '[PROTOTYPE] Graph Theory Notes',
    content:
      '# Graph Theory\n\n## Types of Graphs\n- Directed / Undirected\n- Weighted / Unweighted\n- Cyclic / Acyclic (DAG)\n\n## BFS Algorithm\n1. Initialize queue with source\n2. Mark source as visited\n3. While queue not empty: dequeue, process, enqueue unvisited neighbors\n\n## Time Complexity\n- BFS: O(V + E)\n- DFS: O(V + E)\n- Dijkstra: O((V + E) log V)',
    type: 'text',
    tags: ['graphs', 'algorithms', 'bfs', 'dfs'],
    semester: 5,
    category: 'Lecture Notes',
  });

  db.notes.create({
    userId,
    subjectId: os.id,
    title: '[PROTOTYPE] Process Scheduling Summary',
    content:
      '# Process Scheduling\n\n## Algorithms\n1. FCFS — First Come First Serve (non-preemptive)\n2. SJF — Shortest Job First\n3. Round Robin — time quantum based\n4. Priority Scheduling\n\n## Key Metrics\n- Turnaround Time = Completion - Arrival\n- Waiting Time = Turnaround - Burst\n- Response Time = First Run - Arrival',
    type: 'text',
    tags: ['scheduling', 'processes', 'os'],
    semester: 5,
    category: 'Lecture Notes',
  });

  // Notices
  db.notices.create({
    userId,
    title: '[PROTOTYPE] Mid-Semester Examination Schedule Released',
    content:
      'The mid-semester examination schedule for Semester 5 has been released. Examinations will be held from 10th to 20th October 2026. Please check the detailed timetable on the college portal.',
    source: 'Examination Cell',
    date: '2026-09-25',
    isPinned: true,
    isRead: false,
    category: 'exam',
  });

  db.notices.create({
    userId,
    title: '[PROTOTYPE] Attendance Shortage — Action Required',
    content:
      'Students with attendance below 75% will not be permitted to appear in the mid-semester examinations. Please regularize your attendance immediately.',
    source: 'Academic Department',
    date: '2026-09-22',
    isPinned: true,
    isRead: false,
    category: 'academic',
  });

  db.notices.create({
    userId,
    title: '[PROTOTYPE] HackIndia 2026 — College Team Registration',
    content:
      'Register for HackIndia 2026, the largest student hackathon in India. Teams of 2–4 students. Last date: 30th September 2026. Contact the Training & Placement Cell.',
    source: 'T&P Cell',
    date: '2026-09-18',
    isPinned: false,
    isRead: true,
    category: 'event',
  });

  db.notices.create({
    userId,
    title: '[PROTOTYPE] Semester Fee Payment Deadline',
    content:
      'Semester 5 fee payment deadline is 5th October 2026. Late payment will attract a fine of ₹500 per day. Pay online through the college portal.',
    source: 'Accounts Department',
    date: '2026-09-15',
    isPinned: false,
    isRead: true,
    category: 'fee',
  });

  // Opportunities
  db.opportunities.create({
    userId,
    title: '[PROTOTYPE] Software Development Intern',
    company: 'Razorpay',
    type: 'internship',
    description:
      'Build scalable backend services using Node.js and Go. Work with the payments infrastructure team. 6-month internship, WFH/hybrid.',
    deadline: '2026-10-15',
    applicationStatus: 'saved',
    link: 'https://example.com',
    stipend: '₹35,000/month',
    location: 'Bangalore (Hybrid)',
    tags: ['backend', 'node.js', 'go', 'fintech'],
  });

  db.opportunities.create({
    userId,
    title: '[PROTOTYPE] Google Summer of Code 2026',
    company: 'Google',
    type: 'open_source',
    description:
      'Contribute to open-source organizations under the Google Summer of Code program. 12-week program with stipend.',
    deadline: '2026-10-01',
    applicationStatus: 'applied',
    link: 'https://summerofcode.withgoogle.com',
    stipend: '$3,000–$6,600',
    location: 'Remote',
    tags: ['open-source', 'google', 'gsoc'],
  });

  db.opportunities.create({
    userId,
    title: '[PROTOTYPE] GATE 2027 — CS Fellowship',
    company: 'IIT Delhi',
    type: 'fellowship',
    description:
      'GATE qualified students are eligible for M.Tech admission with full fellowship (₹12,400/month) at IIT Delhi.',
    deadline: '2026-11-01',
    applicationStatus: 'saved',
    stipend: '₹12,400/month',
    location: 'New Delhi',
    tags: ['gate', 'mtech', 'iit', 'fellowship'],
  });

  db.seeded.mark(userId);
}
