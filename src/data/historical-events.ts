
import { HistoricalEvent } from '../lib/game-utils';

export const historicalEvents: HistoricalEvent[] = [
  {
    id: '1',
    title: 'La scoperta dell\'America',
    description: 'Cristoforo Colombo approda nel Nuovo Mondo, segnando l\'inizio dell\'era moderna delle esplorazioni europee.',
    date: new Date('1492-10-12'),
    category: 'Esplorazioni',
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1571172964533-d2d13d88ce7e?q=80&w=800&auto=format'
  },
  {
    id: '2',
    title: 'La caduta del muro di Berlino',
    description: 'Il muro che divideva Berlino Est da Berlino Ovest viene abbattuto, simboleggiando la fine della Guerra Fredda.',
    date: new Date('1989-11-09'),
    category: 'Storia contemporanea',
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1597582324134-65a0d273152e?q=80&w=800&auto=format'
  },
  {
    id: '3',
    title: 'L\'unità d\'Italia',
    description: 'Proclamazione del Regno d\'Italia con Vittorio Emanuele II come primo re d\'Italia.',
    date: new Date('1861-03-17'),
    category: 'Storia italiana',
    difficulty: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=800&auto=format'
  },
  {
    id: '4',
    title: 'Primo sbarco sulla Luna',
    description: 'Neil Armstrong diventa il primo uomo a camminare sulla superficie lunare.',
    date: new Date('1969-07-20'),
    category: 'Esplorazione spaziale',
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=800&auto=format'
  },
  {
    id: '5',
    title: 'Invenzione della stampa a caratteri mobili',
    description: 'Johannes Gutenberg perfeziona la tecnica di stampa a caratteri mobili in Europa.',
    date: new Date('1455-02-23'),
    category: 'Invenzioni',
    difficulty: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=800&auto=format'
  },
  {
    id: '6',
    title: 'Inizio della Prima Guerra Mondiale',
    description: 'L\'assassinio dell\'arciduca Francesco Ferdinando a Sarajevo scatena il conflitto mondiale.',
    date: new Date('1914-06-28'),
    category: 'Guerre',
    difficulty: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1580130881321-0e0b3314a3a6?q=80&w=800&auto=format'
  },
  {
    id: '7',
    title: 'La Rivoluzione Francese',
    description: 'Presa della Bastiglia a Parigi, evento simbolico dell\'inizio della Rivoluzione.',
    date: new Date('1789-07-14'),
    category: 'Rivoluzioni',
    difficulty: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9357976b82?q=80&w=800&auto=format'
  },
  {
    id: '8',
    title: 'Fine della Seconda Guerra Mondiale in Europa',
    description: 'La Germania nazista si arrende ufficialmente alle forze alleate.',
    date: new Date('1945-05-08'),
    category: 'Guerre',
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1582034986517-30d163b1b96a?q=80&w=800&auto=format'
  },
  {
    id: '9',
    title: 'Firma dei Trattati di Roma',
    description: 'Vengono firmati i trattati che istituiscono la Comunità Economica Europea, precursore dell\'Unione Europea.',
    date: new Date('1957-03-25'),
    category: 'Storia europea',
    difficulty: 'hard',
    imageUrl: 'https://images.unsplash.com/photo-1513135467880-6c41603bfa87?q=80&w=800&auto=format'
  },
  {
    id: '10',
    title: 'L\'eruzione del Vesuvio che distrusse Pompei',
    description: 'Una devastante eruzione vulcanica seppellisce le città romane di Pompei ed Ercolano.',
    date: new Date('0079-08-24'),
    category: 'Disastri naturali',
    difficulty: 'hard',
    imageUrl: 'https://images.unsplash.com/photo-1566154184241-8e53b9559746?q=80&w=800&auto=format'
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
