# Local card images

The `cards/` folder uses grade as the first level and group as the second level.

```text
cards/
  local-cards.js
  中班上学期/
    color/
      blue.jpg
      yellow.jpg
    animals/
      cat.jpg
      dog.jpg
  中班下学期/
    fruits/
      apple.jpg
      banana.jpg
```

Rules:

- First-level folders are grades, such as `中班上学期`.
- Second-level folders are groups, such as `color`.
- Image file names become the default English words, so `blue.jpg` becomes `blue`.

After adding or moving images, run this from the project root:

```bat
generate-local-cards.bat
```

It updates `cards/local-cards.js`, which is loaded by `index.html`.
