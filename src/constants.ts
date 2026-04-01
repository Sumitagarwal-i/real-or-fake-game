export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Fact {
  text: string;
  isReal: boolean;
  explanation: string;
  difficulty: Difficulty;
}

export const FACTS: Fact[] = [
  // EASY
  {
    text: "Sharks are older than trees.",
    isReal: true,
    explanation: "Sharks have been around for about 400 million years; trees appeared about 350 million years ago.",
    difficulty: 'hard'
  },
  {
    text: "Saudi Arabia imports camels from Australia.",
    isReal: true,
    explanation: "While they have their own, they import Australian camels for meat and breeding because they are disease-free.",
    difficulty: 'hard'
  },
  {
    text: "The surface of Venus is hot enough to melt lead.",
    isReal: true,
    explanation: "With temperatures around 880°F (470°C), lead would indeed be a liquid on Venus.",
    difficulty: 'medium'
  },
  {
    text: "Vatican City has the highest crime rate in the world per capita.",
    isReal: true,
    explanation: "Because of its tiny population and millions of tourists, the crimes-per-person ratio is technically the highest.",
    difficulty: 'hard'
  },
  {
    text: "A strawberry is not a berry, but a pumpkin is.",
    isReal: true,
    explanation: "Botanically, berries develop from a single ovary. Pumpkins, watermelons, and bananas qualify; strawberries don't.",
    difficulty: 'medium'
  },
  {
    text: "There are more possible iterations of a game of chess than atoms in the universe.",
    isReal: true,
    explanation: "The Shannon number (10^120) is much larger than the estimated number of atoms (10^80).",
    difficulty: 'hard'
  },
  {
    text: "The first person to survive Niagara Falls in a barrel was a 63-year-old teacher.",
    isReal: true,
    explanation: "Annie Edson Taylor took the plunge in 1901 and survived.",
    difficulty: 'hard'
  },
  {
    text: "A day on Venus is longer than its year.",
    isReal: true,
    explanation: "Venus takes 243 Earth days to rotate and 225 Earth days to orbit the Sun.",
    difficulty: 'medium'
  },
  {
    text: "The Eiffel Tower was originally intended for Barcelona.",
    isReal: true,
    explanation: "Barcelona rejected Gustave Eiffel's design, thinking it would be an eyesore.",
    difficulty: 'hard'
  },
  {
    text: "Mammoths were still alive when the Great Pyramid was being built.",
    isReal: true,
    explanation: "A small population of mammoths survived on Wrangel Island until about 1650 BC.",
    difficulty: 'hard'
  },
  {
    text: "The state of Maine is the closest U.S. state to Africa.",
    isReal: true,
    explanation: "Quoddy Head, Maine, is the closest point in the U.S. to the African continent.",
    difficulty: 'hard'
  },
  {
    text: "Bananas are berries, but raspberries are not.",
    isReal: true,
    explanation: "Botanically, bananas fit the definition of a berry; raspberries are 'aggregate fruits'.",
    difficulty: 'medium'
  },
  {
    text: "The national animal of Scotland is the Unicorn.",
    isReal: true,
    explanation: "It has been a symbol of Scotland since the 12th century.",
    difficulty: 'easy'
  },
  {
    text: "The inventor of the Pringles can is buried in one.",
    isReal: true,
    explanation: "Fredric Baur's ashes were buried in a Pringles can in 2008.",
    difficulty: 'hard'
  },
  {
    text: "Russia has more surface area than Pluto.",
    isReal: true,
    explanation: "Russia covers 17.1 million sq km; Pluto covers about 16.7 million sq km.",
    difficulty: 'medium'
  },
  {
    text: "Oxford University is older than the Aztec Empire.",
    isReal: true,
    explanation: "Oxford teaching started in 1096; the Aztec Empire was founded in 1325.",
    difficulty: 'medium'
  },
  {
    text: "A cloud can weigh more than a million pounds.",
    isReal: true,
    explanation: "The average cumulus cloud weighs about 1.1 million pounds.",
    difficulty: 'medium'
  },
  {
    text: "Wombat poop is cube-shaped.",
    isReal: true,
    explanation: "The shape helps it stay on rocks to mark territory without rolling away.",
    difficulty: 'medium'
  },
  {
    text: "The moon has moonquakes.",
    isReal: true,
    explanation: "They are caused by the Earth's gravitational pull.",
    difficulty: 'medium'
  },
  {
    text: "A 'jiffy' is an actual unit of time.",
    isReal: true,
    explanation: "In physics, it's the time light takes to travel one centimeter in a vacuum.",
    difficulty: 'medium'
  },
  {
    text: "Nintendo was founded when Jack the Ripper was still active.",
    isReal: true,
    explanation: "Nintendo was founded in 1889; Jack the Ripper's murders occurred in 1888.",
    difficulty: 'hard'
  },
  {
    text: "The smell of freshly cut grass is a plant distress call.",
    isReal: true,
    explanation: "Plants release chemicals to signal they are being attacked.",
    difficulty: 'hard'
  },
  {
    text: "A blue whale's heart is the size of a car.",
    isReal: true,
    explanation: "It's roughly the size of a bumper car or a small golf cart.",
    difficulty: 'easy'
  },
  {
    text: "The first webcam was created to watch a coffee pot.",
    isReal: true,
    explanation: "Cambridge researchers set it up in 1991 to check if the coffee was ready.",
    difficulty: 'hard'
  },
  {
    text: "The Great Fire of London killed only 6 people.",
    isReal: true,
    explanation: "Despite destroying thousands of homes, the recorded death toll was tiny.",
    difficulty: 'hard'
  },
  {
    text: "A blue whale's tongue weighs as much as an elephant.",
    isReal: true,
    explanation: "Their tongues can weigh up to 2.7 tons.",
    difficulty: 'hard'
  },
  {
    text: "The surface of the Sun is hotter than its atmosphere.",
    isReal: false,
    explanation: "The Sun's corona is millions of degrees; the surface is only about 10,000°F.",
    difficulty: 'hard'
  },
  {
    text: "Humans share 50% of their DNA with bananas.",
    isReal: true,
    explanation: "We share basic cellular functions with almost all life on Earth.",
    difficulty: 'easy'
  },
  {
    text: "An octopus has three hearts.",
    isReal: true,
    explanation: "Two pump blood to the gills, one to the rest of the body.",
    difficulty: 'easy'
  },
  {
    text: "A snail can sleep for three years.",
    isReal: true,
    explanation: "Snails can enter a state of dormancy in extreme weather.",
    difficulty: 'easy'
  },
  {
    text: "The Great Wall of China is visible from the Moon.",
    isReal: false,
    explanation: "It is not visible to the naked eye from the Moon.",
    difficulty: 'easy'
  },
  {
    text: "Goldfish have a 3-second memory.",
    isReal: false,
    explanation: "Goldfish have memories that last for months.",
    difficulty: 'easy'
  },
  {
    text: "Lightning never strikes the same place twice.",
    isReal: false,
    explanation: "Lightning often strikes the same place multiple times.",
    difficulty: 'easy'
  },
  {
    text: "Bulls are enraged by the color red.",
    isReal: false,
    explanation: "Bulls are color-blind to red; they react to the movement.",
    difficulty: 'easy'
  },
  {
    text: "Bats are blind.",
    isReal: false,
    explanation: "Bats can see quite well, but use echolocation for hunting.",
    difficulty: 'easy'
  },
  {
    text: "Tomatoes are a fruit.",
    isReal: true,
    explanation: "Botanically, they are fruits because they contain seeds.",
    difficulty: 'easy'
  },
  {
    text: "Mount Everest is the tallest mountain on Earth.",
    isReal: false,
    explanation: "Mauna Kea is taller from base to peak, but Everest is highest above sea level.",
    difficulty: 'easy'
  },
  {
    text: "A group of crows is called a murder.",
    isReal: true,
    explanation: "This is the collective noun for crows.",
    difficulty: 'easy'
  },
  {
    text: "Polar bear skin is white.",
    isReal: false,
    explanation: "Their skin is black; their fur is translucent.",
    difficulty: 'easy'
  },
  {
    text: "The Great Pyramid was built by slaves.",
    isReal: false,
    explanation: "It was built by paid, respected laborers.",
    difficulty: 'easy'
  },
  {
    text: "An ostrich's eye is bigger than its brain.",
    isReal: true,
    explanation: "Their eyes are the largest of any land animal.",
    difficulty: 'easy'
  },
  {
    text: "Honey never spoils.",
    isReal: true,
    explanation: "Edible honey has been found in 3,000-year-old tombs.",
    difficulty: 'easy'
  },
  {
    text: "Peanuts are nuts.",
    isReal: false,
    explanation: "Peanuts are legumes.",
    difficulty: 'easy'
  },
  {
    text: "Sharks are mammals.",
    isReal: false,
    explanation: "Sharks are fish.",
    difficulty: 'easy'
  }
];
