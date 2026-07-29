export const SUBJECTS = [
  {
    id: 'higher-math',
    name: 'Higher Math',
    number: '01',
    color: 'bg-purple/20 border-purple text-dark',
    accentColor: '#be9af5',
    icon: 'Calculator',
    description: 'Calculus, Geometry, Algebra, and Trigonometry masterclasses.'
  },
  {
    id: 'physics',
    name: 'Physics',
    number: '02',
    color: 'bg-accent/15 border-accent text-dark',
    accentColor: '#ff5734',
    icon: 'Atom',
    description: 'Mechanics, Electromagnetism, Modern Physics, and Thermodynamics.'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    number: '03',
    color: 'bg-yellow/30 border-yellow text-dark',
    accentColor: '#fccc42',
    icon: 'FlaskConical',
    description: 'Organic Chemistry, Physical Chemistry, and Inorganic reactions.'
  },
  {
    id: 'biology',
    name: 'Biology',
    number: '04',
    color: 'bg-purple/20 border-purple text-dark',
    accentColor: '#be9af5',
    icon: 'Dna',
    description: 'Botany, Zoology, Cell Biology, and Genetics preparation.'
  },
  {
    id: 'english',
    name: 'English',
    number: '05',
    color: 'bg-accent/15 border-accent text-dark',
    accentColor: '#ff5734',
    icon: 'BookOpen',
    description: 'Grammar rules, writing skills, and HSC literature comprehension.'
  },
  {
    id: 'bangla',
    name: 'Bangla',
    number: '06',
    color: 'bg-yellow/30 border-yellow text-dark',
    accentColor: '#fccc42',
    icon: 'Languages',
    description: 'Bangla 1st Paper prose & poetry, and 2nd Paper grammar.'
  },
  {
    id: 'ict',
    name: 'ICT',
    number: '07',
    color: 'bg-purple/20 border-purple text-dark',
    accentColor: '#be9af5',
    icon: 'Cpu',
    description: 'C Programming, HTML/Web Design, Logic Gates, and Number Systems.'
  }
];

export const SUBJECTS_MAP = SUBJECTS.reduce((acc, sub) => {
  acc[sub.id] = sub;
  return acc;
}, {});
