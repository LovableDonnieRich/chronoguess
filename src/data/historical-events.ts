
import { HistoricalEvent } from '../lib/game-utils';

export const historicalEvents: HistoricalEvent[] = [
  {
    id: '1',
    title: 'Discovery of America',
    description: 'Christopher Columbus reaches the Americas, marking the beginning of European exploration in the New World.',
    date: new Date('1492-10-12'),
    category: 'Exploration',
    difficulty: 'easy'
  },
  {
    id: '2',
    title: 'Fall of the Berlin Wall',
    description: 'The wall dividing East and West Berlin is brought down, symbolizing the end of the Cold War.',
    date: new Date('1989-11-09'),
    category: 'Modern History',
    difficulty: 'easy'
  },
  {
    id: '3',
    title: 'Italian Unification',
    description: 'Proclamation of the Kingdom of Italy with Victor Emmanuel II as the first King of Italy.',
    date: new Date('1861-03-17'),
    category: 'Italian History',
    difficulty: 'medium'
  },
  {
    id: '4',
    title: 'First Moon Landing',
    description: 'Neil Armstrong becomes the first human to walk on the surface of the Moon.',
    date: new Date('1969-07-20'),
    category: 'Space Exploration',
    difficulty: 'easy'
  },
  {
    id: '5',
    title: 'Invention of Movable Type Printing',
    description: 'Johannes Gutenberg perfects the movable type printing technique in Europe.',
    date: new Date('1455-02-23'),
    category: 'Inventions',
    difficulty: 'medium'
  },
  {
    id: '6',
    title: 'Beginning of World War I',
    description: 'Assassination of Archduke Franz Ferdinand in Sarajevo triggers the global conflict.',
    date: new Date('1914-06-28'),
    category: 'Wars',
    difficulty: 'medium'
  },
  {
    id: '7',
    title: 'The French Revolution',
    description: 'Storming of the Bastille in Paris, symbolic beginning of the Revolution.',
    date: new Date('1789-07-14'),
    category: 'Revolutions',
    difficulty: 'medium'
  },
  {
    id: '8',
    title: 'End of World War II in Europe',
    description: 'Nazi Germany officially surrenders to the Allied forces.',
    date: new Date('1945-05-08'),
    category: 'Wars',
    difficulty: 'easy'
  },
  {
    id: '9',
    title: 'Signing of the Treaties of Rome',
    description: 'The treaties establishing the European Economic Community, predecessor to the European Union, are signed.',
    date: new Date('1957-03-25'),
    category: 'European History',
    difficulty: 'hard'
  },
  {
    id: '10',
    title: 'Eruption of Vesuvius Destroying Pompeii',
    description: 'A devastating volcanic eruption buries the Roman cities of Pompeii and Herculaneum.',
    date: new Date('0079-08-24'),
    category: 'Natural Disasters',
    difficulty: 'hard'
  }
];

export function getRandomEvent(): HistoricalEvent {
  const randomIndex = Math.floor(Math.random() * historicalEvents.length);
  return historicalEvents[randomIndex];
}

export function getRandomEvents(count: number): HistoricalEvent[] {
  const shuffled = [...historicalEvents].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
