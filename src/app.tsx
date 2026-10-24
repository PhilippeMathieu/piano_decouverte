// Navigation par l'adresse (#/…) : accueil, étape, leçon, exercice, autocollants, parents.
import { useEffect, useState } from 'preact/hooks';
import { Home } from './screens/Home';
import { StepView } from './screens/StepView';
import { LessonView } from './screens/Lesson';
import { ExerciseView } from './screens/Exercise';
import { Parents, Stickers } from './screens/Parents';

const route = () => location.hash.replace(/^#\/?/, '').split('/');

export function App() {
  const [r, setR] = useState(route());
  useEffect(() => {
    const f = () => {
      setR(route());
      window.scrollTo(0, 0);
    };
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  const [page, arg] = r;
  switch (page) {
    case 'etape':
      return <StepView key={arg} id={Number(arg)} />;
    case 'lecon':
      return <LessonView key={arg} id={arg} />;
    case 'exercice':
      return <ExerciseView key={arg} id={arg} />;
    case 'autocollants':
      return <Stickers />;
    case 'parents':
      return <Parents />;
    default:
      return <Home />;
  }
}
