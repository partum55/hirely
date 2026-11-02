/* eslint-disable @typescript-eslint/no-explicit-any */
// Demo mode: replaces window.fetch for /api/* with an in-memory fake backend.
// State lives in memory only — a page reload resets the demo.
// ponytail: no persistence, add localStorage if demo visitors need to keep data across reloads.

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const user = { id: 'demo-user', email: 'demo@hirely.app', full_name: 'Demo Student', avatar_url: '' };

const sections = {
  personal: { name: user.full_name, email: user.email, phone: '+380 50 123 4567', location: 'Lviv, Ukraine', linkedin: 'https://linkedin.com/in/demo', website: '' },
  summary: 'Motivated CS student with hands-on experience in React and TypeScript, looking for a junior frontend role.',
  experience: [{ company: 'Acme Studio', position: 'Frontend Intern', start_date: '2025-06', end_date: '2025-09', location: 'Remote', description: 'Built UI components and fixed accessibility issues.', achievements: ['Cut bundle size by 30%', 'Shipped 12 features'] }],
  education: [{ institution: 'Ukrainian Catholic University', degree: 'BSc Computer Science', start_date: '2023-09', end_date: '2027-06', location: 'Lviv', description: '' }],
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'Git'],
  projects: [{ name: 'Hirely', description: 'AI career assistant for students', url: '', technologies: ['React', 'Django'] }],
  languages: [{ name: 'English', level: 'B2' }, { name: 'Ukrainian', level: 'Native' }],
  certifications: [],
};

let profile: any = {
  ...user, links: { linkedin: 'https://linkedin.com/in/demo' }, summary: sections.summary, preferences: {}, updated_at: now(),
  education: [{ degree: 'BSc Computer Science', institution: 'Ukrainian Catholic University', year: '2027', description: '' }],
  experience: [{ title: 'Frontend Intern', company: 'Acme Studio', start: '2025-06', end: '2025-09', description: 'Built UI components.' }],
  skills: sections.skills.map((name) => ({ name, level: 'intermediate' })),
  projects: [{ title: 'Hirely', description: 'AI career assistant', tech: 'React, Django', link: '' }],
};

const cvs: any[] = [{ id: uid(), title: 'Frontend Developer CV', template_key: 'modern', sections, version: 1, changelog: [], created_at: now(), updated_at: now() }];

const TRAINER: Record<string, Array<[string, string[], number]>> = {
  javascript: [
    ['What does `typeof null` return?', ['"null"', '"object"', '"undefined"', '"number"'], 1],
    ['Which method creates a new array from the results of a function on every element?', ['forEach', 'filter', 'map', 'reduce'], 2],
    ['What is a closure?', ['A function bundled with its lexical scope', 'A private class field', 'A loop construct', 'A module bundler'], 0],
    ['`===` differs from `==` because it…', ['Is faster', 'Skips type coercion', 'Compares references only', 'Works on strings only'], 1],
    ['Which keyword declares a block-scoped, reassignable variable?', ['var', 'let', 'const', 'static'], 1],
  ],
  react: [
    ['Which hook runs side effects after render?', ['useMemo', 'useRef', 'useEffect', 'useId'], 2],
    ['Why do list items need a `key`?', ['Styling', 'Stable identity for reconciliation', 'Accessibility', 'Event delegation'], 1],
    ['State updates in React are…', ['Always synchronous', 'Batched and scheduled', 'Only allowed in classes', 'Persisted to localStorage'], 1],
    ['What does `useCallback` memoize?', ['A value', 'A component', 'A function reference', 'A context'], 2],
    ['Props are…', ['Mutable by the child', 'Read-only inputs', 'Global state', 'Only strings'], 1],
  ],
  soft_skills: [
    ['In STAR, what does the "A" stand for?', ['Attitude', 'Action', 'Approach', 'Analysis'], 1],
    ['Best response to "What is your biggest weakness?"', ['"I have none"', 'A real weakness plus how you are improving it', 'A strength in disguise', 'Decline to answer'], 1],
    ['When you disagree with a teammate, first…', ['Escalate to a manager', 'Seek to understand their view', 'Stay silent', 'Redo their work'], 1],
    ['A good question to ask an interviewer:', ['"How much vacation do I get?"', '"What does success look like in the first 90 days?"', '"Do you check my social media?"', '"Can I leave early?"'], 1],
    ['Thank-you email after an interview should be sent…', ['A week later', 'Within 24 hours', 'Never', 'Only if you got an offer'], 1],
  ],
};
const trainerResults: any[] = [];

const INTERVIEW: Record<string, string[]> = {
  'frontend-basics': ['Explain the CSS box model.', 'What is the difference between `let`, `const` and `var`?', 'How does the browser render a page from HTML to pixels?'],
  'backend-basics': ['What is the difference between REST and GraphQL?', 'How would you design an idempotent POST endpoint?', 'Explain database indexes and their trade-offs.'],
  algorithms: ['Explain Big-O notation with an example.', 'How does binary search work and when can you use it?', 'Compare a hash map and a balanced tree.'],
  'system-design': ['How would you design a URL shortener?', 'What is caching and where would you add it?', 'Explain horizontal vs vertical scaling.'],
  behavioral: ['Tell me about a time you handled a conflict in a team.', 'Describe a project you are proud of.', 'How do you prioritize when everything is urgent?'],
};
const sessions: any[] = [];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const pdf = (title: string) => {
  const t = title.replace(/[()\\]/g, '');
  return `%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 400 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length ${34 + t.length}>>stream\nBT /F1 18 Tf 20 100 Td (${t} - demo) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF`;
};

function interviewResult(s: any) {
  const answered = s.answers.filter((a: any) => a.text.trim().length > 0);
  const score = Math.min(100, Math.round((answered.length / s.questions.length) * 60 + Math.min(40, answered.reduce((n: number, a: any) => n + a.text.length, 0) / 20)));
  return {
    status: 'completed', score, completed_at: now(), ended_at: now(), can_retake: true,
    feedback: 'Demo feedback (no real AI in this build).',
    ai_feedback: {
      strengths: ['Clear structure', 'Relevant examples'], weaknesses: ['Answers could go deeper'],
      tips: ['Use the STAR method', 'Quantify your impact'],
      overall_assessment: 'Solid attempt. This is canned demo feedback — the full app uses an LLM.',
      recommendation: 'Practice a few more rounds on this topic.',
    },
    checklist: [{ criterion: 'Answered every question', passed: answered.length === s.questions.length }, { criterion: 'Gave detailed answers', passed: score > 70 }],
    detailed_review: s.questions.map((q: any) => ({
      question_id: q.id, score: Math.min(10, 4 + Math.round((s.answers.find((a: any) => a.question_id === q.id)?.text.length || 0) / 40)),
      answer_review: 'Reasonable answer for a demo.', suggestions: 'Add a concrete example.',
    })),
  };
}

async function route(method: string, path: string, query: URLSearchParams, body: any): Promise<Response> {
  let m: RegExpMatchArray | null;
  const is = (re: RegExp) => (m = path.match(re));

  if (path === '/api/auth/me') return json(user);
  if (path === '/api/auth/google/start') return json({ auth_url: '/auth/callback' });
  if (path === '/api/auth/logout') return json({ status: 'ok' });
  if (path === '/api/healthz/') return json({ status: 'ok' });

  if (path === '/api/profile/') {
    if (method === 'PUT') profile = { ...profile, ...body, updated_at: now() };
    return json(profile);
  }

  if (path === '/api/cvs/generate-preview/') return json(sections);
  if (path === '/api/cvs/generate/') {
    const cv = { id: uid(), title: 'AI-generated CV', template_key: 'clean', sections, version: 1, changelog: [], created_at: now(), updated_at: now() };
    cvs.unshift(cv);
    return json(cv, 201);
  }
  if (path === '/api/cvs/') {
    if (method === 'POST') {
      const cv = { id: uid(), version: 1, changelog: [], template_key: 'clean', sections: {}, ...body, created_at: now(), updated_at: now() };
      cvs.unshift(cv);
      return json(cv, 201);
    }
    return json(cvs);
  }
  if (is(/^\/api\/cvs\/([^/]+)\/export\/$/)) {
    const cv = cvs.find((c) => c.id === m![1]);
    const fmt = query.get('format') || 'pdf';
    return new Response(pdf(cv?.title || 'CV'), { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="cv-demo.${fmt}"` } });
  }
  if (is(/^\/api\/cvs\/([^/]+)\/enhance\/$/)) return json({ enhanced: body?.context || '' });
  if (is(/^\/api\/cvs\/([^/]+)\/$/)) {
    const i = cvs.findIndex((c) => c.id === m![1]);
    if (i < 0) return json({ message: 'Not found' }, 404);
    if (method === 'DELETE') { cvs.splice(i, 1); return json({}, 200); }
    if (method === 'PUT') cvs[i] = { ...cvs[i], ...body, version: cvs[i].version + 1, updated_at: now() };
    return json(cvs[i]);
  }

  if (path === '/api/trainer/categories/') return json({ categories: Object.keys(TRAINER) });
  if (is(/^\/api\/trainer\/questions\/([^/]+)\/$/)) {
    const bank = TRAINER[m![1]];
    if (!bank) return json({ message: 'Unknown category' }, 404);
    const n = Number(query.get('n')) || 10;
    const questions = bank.slice(0, n).map(([text, options, correct], i) => ({ id: `${m![1]}-${i}`, text, options, correct }));
    return json({ category: m![1], count: questions.length, questions });
  }
  if (path === '/api/trainer/submit/') {
    const r = { id: uid(), attempts: 1, created_at: now(), ...body };
    trainerResults.unshift(r);
    return json(r, 201);
  }
  if (path === '/api/trainer/results/') return json(trainerResults);
  if (is(/^\/api\/trainer\/results\/([^/]+)\/$/)) return json(trainerResults.find((r) => r.id === m![1]) ?? { message: 'Not found' }, trainerResults.some((r) => r.id === m![1]) ? 200 : 404);

  if (path === '/api/interview/sessions/list/') return json(sessions);
  if (path === '/api/interview/sessions/') {
    const topic = INTERVIEW[body?.topic] ? body.topic : 'behavioral';
    const s = {
      id: uid(), topic, status: 'in_progress', answers: [], created_at: now(), updated_at: now(), started_at: now(),
      questions: INTERVIEW[topic].map((text, i) => ({ id: `q${i}`, text, category: topic })),
    };
    sessions.unshift(s);
    return json(s, 201);
  }
  if (is(/^\/api\/interview\/sessions\/([^/]+)\/(answer|submit|hint|retake)?\/?$/)) {
    const s = sessions.find((x) => x.id === m![1]);
    if (!s) return json({ message: 'Not found' }, 404);
    const action = m![2];
    if (action === 'answer') {
      s.answers = s.answers.filter((a: any) => a.question_id !== body.question_id).concat(body);
    } else if (action === 'submit') {
      Object.assign(s, interviewResult(s));
    } else if (action === 'hint') {
      return json({ hint: 'Start with a one-sentence definition, then give a concrete example. (Demo hint)' });
    } else if (action === 'retake') {
      const n = { ...s, id: uid(), status: 'in_progress', answers: [], score: undefined, ai_feedback: undefined, detailed_review: undefined, checklist: undefined, created_at: now() };
      sessions.unshift(n);
      return json(n, 201);
    }
    s.updated_at = now();
    return json(s);
  }

  if (path === '/api/export/') return json({ user, profile, cvs, trainerResults, sessions });
  if (path === '/api/erase/') return json({ status: 'ok' });
  if (path === '/api/files/upload/') return json({ id: 1, file_url: '', file_name: 'demo', file_size: 0, uploaded_at: now() }, 201);
  if (is(/^\/api\/files\/\d+\/$/)) return json({}, 200);

  return json({ message: `Demo mode: ${method} ${path} is not available` }, 404);
}

if (import.meta.env.VITE_DEMO) {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const req = input instanceof Request ? input : null;
    const url = new URL(req ? req.url : String(input), location.origin);
    if (!url.pathname.startsWith('/api/')) return realFetch(input, init);
    const method = (init?.method || req?.method || 'GET').toUpperCase();
    let body: any;
    try { body = init?.body ? JSON.parse(init.body as string) : undefined; } catch { /* non-JSON body (file upload) */ }
    await new Promise((r) => setTimeout(r, 150)); // feel like a network
    return route(method, url.pathname, url.searchParams, body);
  };
}
