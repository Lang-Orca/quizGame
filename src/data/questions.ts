import { Question } from '../types';

const questions: Record<string, Question[]> = {
  'Culture générale': [
    {
      question: 'Quel est la capitale de la France?',
      choices: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
      answer: 'Paris',
    },
    {
      question: 'En quelle année l\'homme a-t-il marché sur la lune?',
      choices: ['1965', '1969', '1971', '1973'],
      answer: '1969',
    },
    {
      question: 'Qui a peint la Joconde?',
      choices: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
      answer: 'Leonardo da Vinci',
    },
    {
      question: 'Quel est le plus grand océan?',
      choices: ['Atlantique', 'Pacifique', 'Indien', 'Arctique'],
      answer: 'Pacifique',
    },
    {
      question: 'En quelle année la Révolution française a-t-elle commencé?',
      choices: ['1785', '1787', '1789', '1791'],
      answer: '1789',
    },
    {
      question: 'Quel écrivain a écrit "Les Misérables"?',
      choices: ['Alexandre Dumas', 'Victor Hugo', 'Gustave Flaubert', 'Honoré de Balzac'],
      answer: 'Victor Hugo',
    },
    {
      question: 'Combien de continents y a-t-il?',
      choices: ['5', '6', '7', '8'],
      answer: '7',
    },
    {
      question: 'Quel est le plus haut sommet du monde?',
      choices: ['K2', 'Kangchenjunga', 'Everest', 'Lhotse'],
      answer: 'Everest',
    },
    {
      question: 'En quelle année est née la Déclaration des Droits de l\'Homme?',
      choices: ['1776', '1789', '1791', '1848'],
      answer: '1789',
    },
    {
      question: 'Quel peint a peint "La Nuit Étoilée"?',
      choices: ['Claude Monet', 'Vincent van Gogh', 'Paul Cézanne', 'Pierre-Auguste Renoir'],
      answer: 'Vincent van Gogh',
    },
  ],
  'Science': [
    {
      question: 'Quel est le symbole chimique de l\'or?',
      choices: ['Go', 'Au', 'Ag', 'Gd'],
      answer: 'Au',
    },
    {
      question: 'Combien de planètes y a-t-il dans notre système solaire?',
      choices: ['7', '8', '9', '10'],
      answer: '8',
    },
    {
      question: 'Quel gaz composé l\'atmosphère terrestre en majorité?',
      choices: ['Oxygène', 'Azote', 'Dioxyde de carbone', 'Argon'],
      answer: 'Azote',
    },
    {
      question: 'Quelle est la vitesse de la lumière?',
      choices: ['300 000 m/s', '150 000 km/s', '300 000 km/s', '500 000 km/s'],
      answer: '300 000 km/s',
    },
    {
      question: 'Quel scientifique a formulé la théorie de la relativité?',
      choices: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'],
      answer: 'Albert Einstein',
    },
    {
      question: 'Quel est le plus petit élément d\'un atome?',
      choices: ['Proton', 'Neutron', 'Électron', 'Quark'],
      answer: 'Électron',
    },
    {
      question: 'À quelle température l\'eau gèle-t-elle?',
      choices: ['-10°C', '0°C', '10°C', '100°C'],
      answer: '0°C',
    },
    {
      question: 'Combien d\'os le corps humain possède-t-il en moyenne?',
      choices: ['186', '206', '226', '246'],
      answer: '206',
    },
    {
      question: 'Quel est le plus grand organe du corps humain?',
      choices: ['Cœur', 'Poumons', 'Peau', 'Foie'],
      answer: 'Peau',
    },
    {
      question: 'Qui a découvert la pénicilline?',
      choices: ['Jonas Salk', 'Alexander Fleming', 'Marie Curie', 'Louis Pasteur'],
      answer: 'Alexander Fleming',
    },
  ],
  'Sport': [
    {
      question: 'En quelle année les premiers jeux olympiques modernes ont-ils eu lieu?',
      choices: ['1896', '1900', '1912', '1920'],
      answer: '1896',
    },
    {
      question: 'Quel pays a remporté le plus de médailles olympiques?',
      choices: ['Russie', 'Chine', 'États-Unis', 'Allemagne'],
      answer: 'États-Unis',
    },
    {
      question: 'Combien de joueurs y a-t-il dans une équipe de football?',
      choices: ['10', '11', '12', '13'],
      answer: '11',
    },
    {
      question: 'Quel est le plus important tournoi de tennis au monde?',
      choices: ['US Open', 'Wimbledon', 'Roland Garros', 'Australian Open'],
      answer: 'Wimbledon',
    },
    {
      question: 'En quelle année le football professionnel a-t-il commencé en France?',
      choices: ['1920', '1932', '1945', '1960'],
      answer: '1932',
    },
    {
      question: 'Combien de fois Pelé a-t-il remporté la Coupe du Monde?',
      choices: ['1', '2', '3', '4'],
      answer: '3',
    },
    {
      question: 'Quel pays a remporté le plus de coupes du monde de football?',
      choices: ['Allemagne', 'Italie', 'Brésil', 'France'],
      answer: 'Brésil',
    },
    {
      question: 'Combien de joueurs y a-t-il dans une équipe de basket-ball?',
      choices: ['4', '5', '6', '7'],
      answer: '5',
    },
    {
      question: 'Quel est le sport national du Japon?',
      choices: ['Karaté', 'Sumo', 'Judo', 'Tennis de table'],
      answer: 'Sumo',
    },
    {
      question: 'En quelle année le marathon est-il devenu une épreuve olympique?',
      choices: ['1896', '1904', '1908', '1912'],
      answer: '1896',
    },
  ],
  'Histoire': [
    {
      question: 'En quelle année la Première Guerre Mondiale a-t-elle commencé?',
      choices: ['1912', '1914', '1916', '1918'],
      answer: '1914',
    },
    {
      question: 'Qui était le premier empereur romain?',
      choices: ['Jules César', 'Auguste', 'Néron', 'Tibère'],
      answer: 'Auguste',
    },
    {
      question: 'En quelle année la Seconde Guerre Mondiale a-t-elle commencé?',
      choices: ['1937', '1939', '1941', '1943'],
      answer: '1939',
    },
    {
      question: 'Qui a découvert l\'Amérique en 1492?',
      choices: ['Christophe Colomb', 'Amerigo Vespucci', 'Leif Erikson', 'Ferdinand Magellan'],
      answer: 'Christophe Colomb',
    },
    {
      question: 'En quelle année l\'URSS s\'est-elle effondrée?',
      choices: ['1989', '1990', '1991', '1992'],
      answer: '1991',
    },
    {
      question: 'Quel empire a été construit la Grande Muraille de Chine?',
      choices: ['Han', 'Ming', 'Qin', 'Tang'],
      answer: 'Ming',
    },
    {
      question: 'En quelle année la Révolution Française s\'est-elle terminée?',
      choices: ['1792', '1799', '1804', '1815'],
      answer: '1799',
    },
    {
      question: 'Qui était le roi de France le plus long règne?',
      choices: ['Louis XIII', 'Louis XIV', 'Louis XV', 'Louis XVI'],
      answer: 'Louis XIV',
    },
    {
      question: 'En quelle année est tombé le Mur de Berlin?',
      choices: ['1987', '1988', '1989', '1990'],
      answer: '1989',
    },
    {
      question: 'Qui a inventé l\'imprimerie à caractères mobiles?',
      choices: ['Gutenberg', 'Caxton', 'Aldus Manutius', 'Jenson'],
      answer: 'Gutenberg',
    },
  ],
};

export default questions;
