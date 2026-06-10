# Local card images

Put grouped card images under this folder and register them in `local-cards.js`.

Recommended structure:

```text
cards/
  local-cards.js
  animals/
    cat.jpg
    dog.jpg
  fruits/
    apple.jpg
    banana.jpg
```

Then edit `local-cards.js`:

```js
window.LOCAL_CARD_GROUPS = [
  {
    group: "动物",
    cards: [
      { english: "cat", chinese: "猫", image: "cards/animals/cat.jpg" },
      { english: "dog", chinese: "狗", image: "cards/animals/dog.jpg" },
    ],
  },
  {
    group: "水果",
    cards: [
      { english: "apple", chinese: "苹果", image: "cards/fruits/apple.jpg" },
    ],
  },
];
```

When using on mobile, keep `index.html`, `styles.css`, `app.js`, and the full `cards/` folder together.
