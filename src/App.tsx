import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { HabitatSelectScreen } from './screens/HabitatSelectScreen';
import { AnimalSelectScreen } from './screens/AnimalSelectScreen';
import { LessonScreen } from './screens/LessonScreen';
import { ComprehensionCheckScreen } from './screens/ComprehensionCheckScreen';
import { CelebrationScreen } from './screens/CelebrationScreen';
import './styles/global.css';
import './styles/screens.css';

export const App = () => (
  <BrowserRouter>
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/habitats" element={<HabitatSelectScreen />} />
        <Route path="/animals/:habitatId" element={<AnimalSelectScreen />} />
        <Route path="/lesson/:animalId" element={<LessonScreen />} />
        <Route path="/check/:wordId" element={<ComprehensionCheckScreen />} />
        <Route path="/celebration/:animalId" element={<CelebrationScreen />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;
