/* MATRIX CODE RAIN */

const lettersString = "ツテぱびぷのねぬとなゟゑをゐわれるむぬマヤカ阿加多";
const letters = Array.from(lettersString);

// this is to delay the columns so that they will not go down all at once
const delayVariation = 40;
const maxWordLength = 30;
const lettersPerSecond = 20;

// helper function
function elt(type, attrs, ...children) {
  const dom = document.createElement(type);
  if (attrs) Object.assign(dom, attrs);

  for (let child of children) {
    if (typeof child == "string")
      dom.appendChild(document.createTextNode(child));
    else dom.appendChild(child);
  }

  return dom;
}

function randomNumber(min = 0, max) {
  return min + Math.random() * (max - min);
}

function randomItem(array) {
  return array[Math.floor(randomNumber(0, array.length))];
}

// this will render all columns of letters and return an array containing arrays of letters(each array for each column)
function renderColumns() {
  const columns = [];

  const wrapper = elt("div", { className: "wrapper" });
  document.body.appendChild(wrapper);

  for (; wrapper.clientWidth < innerWidth; ) {
    const column = elt("div", { className: "column" });
    column.style.fontSize = randomNumber(13, 20) + "px";
    wrapper.appendChild(column);

    const lettersDOM = [];
    for (; column.clientHeight < innerHeight; ) {
      const letter = elt("span", { className: "letter" }, randomItem(letters));
      letter.style.opacity = "0";
      lettersDOM.push(letter);

      column.appendChild(letter);
    }

    columns.push(lettersDOM);
  }

  return columns;
}

// these
function generateColors(height) {
  const colors = [];

  // the increments were chosen arbitrarily
  const brightnessIncrement = 3;
  const colorIncrement = 15;
  let color = 120,
    brightness = 50;

  for (let i = 0; i < height; i++) {
    colors.push(`hsl(${color}, 100%, ${brightness}%)`);

    if (i > height - 5) {
      color -= colorIncrement;
      brightness += brightnessIncrement;
    }
  }

  return colors;
}

function generateOpacities(height) {
  const opacities = [];

  const opacityIncrement = 1 / (height / 1.5);
  let opacity = 0;

  for (let i = 0; i < height; i++) {
    opacities.push(opacity);
    opacity += opacityIncrement;
  }

  return opacities;
}

async function animateColumn(column) {
  let height = randomNumber(0, maxWordLength);
  let colors = generateColors(height);
  let opacities = generateOpacities(height);

  // this is the index of the first letter from top to bottom
  let currentIndex = -height - randomNumber(0, delayVariation);

  function updateColumn() {
    // instead of creating the colors and opacities inside styleLetters, they are generated here so that they don't need to
    // be recreated every time we update the column
    styleLetters(
      column.filter((_, i) => i >= currentIndex && i < currentIndex + height),
      colors,
      opacities,
      currentIndex
    );
  }

  setInterval(() => {
    currentIndex++;

    // every time we reach the bottom, we kind of reset the column
    // generating a new height, index, set of colors and opacities
    // we have to use >= here because currentIndex is not an integer
    if (currentIndex >= column.length) {
      height = randomNumber(4, maxWordLength);
      colors = generateColors(height);
      opacities = generateOpacities(height);
      currentIndex = -height - randomNumber(0, delayVariation);
    }
    updateColumn();
  }, 1000 / lettersPerSecond);
}

// this will update each letter inside the active range
function styleLetters(letters, colors, opacities, index) {
  letters.forEach((l, i) => {
    let actualIndex;

    if (index < 0) {
      actualIndex = Math.floor(i + Math.abs(index));
    } else {
      actualIndex = i;
    }

    l.style.opacity = opacities[actualIndex];
    l.style.color = colors[actualIndex];
  });
}

function run() {
  const columns = renderColumns();

  for (let c of columns) animateColumn(c);
}

run();
