/* MATRIX RAIN CODE */

// helpers
function elt(type, attrs, ...children) {
  const dom = document.createElement(type);
  if (attrs) Object.assign(dom, attrs);

  for (let child of children) {
    if (typeof child == "string") {
      dom.appendChild(document.createTextNode(child));
    } else {
      dom.appendChild(child);
    }
  }

  return dom;
}

function randomNumber(min, max) {
  return min + Math.random() * (max - min);
}

function randomItem(array) {
  return array[Math.floor(randomNumber(0, array.length))];
}

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

function hideAllLetters(letters) {
  letters.forEach((l) => (l.style.opacity = 0));
}

// this will update each letter inside the active range
function styleLetters(letters, colors, opacities, currentIndex) {
  letters.forEach((l, i) => {
    // it is necessary because if the currentIndex is negative
    //
    if (currentIndex < 0) i = Math.floor(i + Math.abs(currentIndex));

    l.style.opacity = opacities[i];
    l.style.color = colors[i];
  });
}

const letters = [..."ツテぱびぷのねぬとなゟゑをゐわれるむぬマヤカ阿加多"];

// this is to delay the columns so that they will not go down all at once
const delayVariation = 50;
const maxHeight = 50;
let lettersPerSecond = 45;

document.body.appendChild(
  elt(
    "div",
    { className: "range-input-box" },
    elt("span", null, "Speed:"),
    elt("input", {
      type: "range",
      min: "5",
      max: "150",
      step: "5",
      value: lettersPerSecond,
      oninput: (e) => {
        lettersPerSecond = Number(e.target.value);
      },
    })
  )
);

class Column {
  #currentIndex;
  #activePartHeight;
  #colors;
  #opacities;

  constructor(letters) {
    this.letters = letters;

    this.#activePartHeight = randomNumber(4, maxHeight);
    this.#colors = generateColors(this.#activePartHeight);
    this.#opacities = generateOpacities(this.#activePartHeight);

    this.#currentIndex =
      -this.#activePartHeight - randomNumber(0, delayVariation);
  }

  #drawLetters() {
    hideAllLetters(this.letters);

    styleLetters(
      this.letters.filter(
        (_, i) =>
          i > this.#currentIndex &&
          i < this.#currentIndex + this.#activePartHeight
      ),
      this.#colors,
      this.#opacities,
      this.#currentIndex
    );
  }

  update(timeStep) {
    this.#currentIndex += timeStep * lettersPerSecond;

    // every time we reach the bottom, we kind of reset the column
    // generating a new height, index, set of colors and opacities
    if (this.#currentIndex > this.letters.length) {
      this.#activePartHeight = randomNumber(4, maxHeight);
      this.#colors = generateColors(this.#activePartHeight);
      this.#opacities = generateOpacities(this.#activePartHeight);
      this.#currentIndex =
        -this.#activePartHeight - randomNumber(0, delayVariation);
    }

    this.#drawLetters();
  }
}

// this will render all columns of letters and return an array containing arrays of letters(each array for each column)
function renderColumns() {
  const columns = [];

  const wrapper = elt("div", { className: "wrapper" });
  document.body.appendChild(wrapper);

  for (; wrapper.clientWidth < innerWidth; ) {
    const column = elt("div", { className: "column" });
    column.style.fontSize = randomNumber(13, 23) + "px";
    wrapper.appendChild(column);

    const lettersDOM = [];
    for (; column.clientHeight < innerHeight; ) {
      const letter = elt("span", { className: "letter" }, randomItem(letters));
      letter.style.opacity = "0";

      lettersDOM.push(letter);
      column.appendChild(letter);
    }

    columns.push(new Column(lettersDOM));
  }

  return columns;
}

// convenient wrapper function to run animations
function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      frameFunc(timeStep);
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function animateColumns(columns) {
  runAnimation((timeStep) => {
    columns.forEach((c) => c.update(timeStep));
  });
}

function run() {
  const columns = renderColumns();
  animateColumns(columns);
}

run();
