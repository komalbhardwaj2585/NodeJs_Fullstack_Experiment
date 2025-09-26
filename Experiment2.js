const express = require('express');
const app = express();

app.use(express.json());

let cards = [
  { id: 1, suit: 'Hearts', value: 'Ace' },
  { id: 2, suit: 'Spades', value: 'King' },
  { id: 3, suit: 'Diamonds', value: 'Queen' }
];

let nextId = 4;

app.get('/', (req, res) => {
  res.send('Welcome to the Playing Cards API!');
});

app.get('/cards', (req, res) => {
  res.json(cards);
});

app.get('/cards/:id', (req, res) => {
  const card = cards.find(c => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ error: 'Card not found' });
  res.json(card);
});

app.post('/cards', (req, res) => {
  const { suit, value } = req.body;
  if (!suit || !value) return res.status(400).json({ error: 'Suit and value are required' });
  const newCard = { id: nextId++, suit, value };
  cards.push(newCard);
  res.status(201).json(newCard);
});

app.delete('/cards/:id', (req, res) => {
  const index = cards.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Card not found' });
  cards.splice(index, 1);
  res.json({ message: 'Card deleted' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running`);
});
