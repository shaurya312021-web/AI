import { ResumeData, JobDescription, UserSubscription } from '../types';

export const INITIAL_RESUME: ResumeData = {
  id: 'resume-1',
  title: 'Full Stack Software Engineer',
  personalInfo: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan-dev',
    github: 'github.com/alexmorgan-dev',
    portfolio: 'alexmorgan.dev',
    summary: 'Results-driven Full Stack Software Engineer with 4+ years of experience architecting scalable React & Node.js applications, leading cloud integrations, and optimizing web performance.',
  },
  experiences: [
    {
      id: 'exp-1',
      company: 'TechPulse Solutions',
      role: 'Senior Frontend Engineer',
      location: 'San Francisco, CA',
      startDate: '2023-01',
      endDate: 'Present',
      isCurrent: true,
      bulletPoints: [
        'Architected a micro-frontend platform serving 500k+ monthly active users, reducing load times by 42%.',
        'Engineered real-time collaboration tools using WebSockets and React 19, increasing user session duration by 28%.',
        'Spearheaded automated CI/CD pipeline optimization using GitHub Actions, cutting build deploy cycles from 25m to 7m.'
      ]
    },
    {
      id: 'exp-2',
      company: 'Nexus Innovations',
      role: 'Full Stack Developer',
      location: 'Austin, TX',
      startDate: '2021-06',
      endDate: '2022-12',
      isCurrent: false,
      bulletPoints: [
        'Developed high-throughput Express REST APIs integrated with PostgreSQL, handling 1.2M daily RPC requests.',
        'Implemented OAuth 2.0 and JWT security modules across 12 microservices, zero security vulnerabilities logged.',
        'Mentored 4 junior developers in TypeScript best practices and state management architecture.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      fieldOfStudy: 'Computer Science & Software Engineering',
      startDate: '2017-08',
      endDate: '2021-05',
      gpa: '3.82',
      highlights: 'Dean\'s Honor List, President of Software Engineering Club'
    }
  ],
  skills: {
    technical: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'GraphQL', 'Tailwind CSS', 'Docker', 'Redis', 'Python'],
    soft: ['Agile / Scrum', 'Technical Leadership', 'Cross-Functional Communication', 'System Architecture Design'],
    tools: ['Git', 'Vite', 'VS Code', 'Postman', 'Figma', 'AWS CloudWatch']
  },
  projects: [
    {
      id: 'proj-1',
      title: 'DevPulse Analytics Dashboard',
      description: 'Real-time performance metrics tracking suite for Cloud Run microservices with interactive Recharts visualizations.',
      techStack: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Docker'],
      link: 'https://github.com/alexmorgan/devpulse'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect – Associate',
    'Certified Professional Scrum Master (PSM I)'
  ],
  styling: {
    templateId: 'tech',
    accentColor: '#2563eb',
    fontFamily: 'sans',
    density: 'normal'
  },
  updatedAt: new Date().toISOString()
};

export const SAMPLE_JOB_DESCRIPTION: JobDescription = {
  id: 'jd-1',
  title: 'Senior Full Stack AI Platform Engineer',
  company: 'AetherAI Labs',
  rawText: `About the Role:
AetherAI Labs is looking for a Senior Full Stack Engineer to lead our Next-Gen AI Platform team. You will build highly interactive web clients, microservices, and integrate Generative AI models.

Requirements:
- 4+ years software engineering experience building web applications with React, TypeScript, and Node.js.
- Strong hands-on experience with Express / Python FastAPI backend architectures and relational databases (PostgreSQL/Cloud SQL).
- Deep knowledge of Docker containerization, cloud deployment (Cloud Run/AWS), and REST/RPC API optimizations.
- Familiarity with AI integration (OpenAI API, Gemini API, prompt engineering, streaming responses).
- Proven track record of system design, performance monitoring, unit testing, and team mentoring.
- Excellent communication skills and ability to thrive in fast-paced environments.`,
  extractedSkills: [
    'React', 'TypeScript', 'Node.js', 'Express', 'Python', 'FastAPI',
    'PostgreSQL', 'Docker', 'Cloud Run', 'Generative AI', 'Gemini API',
    'OpenAI API', 'System Design', 'CI/CD', 'REST APIs'
  ],
  requiredYears: 4
};

export const INITIAL_SUBSCRIPTION: UserSubscription = {
  plan: 'free_explorer',
  interviewCredits: 1,
  atsScansRemaining: 1,
  builderCreationsRemaining: 1,
  isSubscribed: false
};
