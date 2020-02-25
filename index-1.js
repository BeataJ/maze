const { Engine, Render, Runner, World, Bodies, Body, Events, Mouse } = Matter;

const cellsHorizontal = 15;
const cellsVertical = 13;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);
function start() {
  // Walls
  const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
  ];
  World.add(world, walls);

  // Maze generation

  const shuffle = arr => {
    let counter = arr.length;

    while (counter > 0) {
      const index = Math.floor(Math.random() * counter);

      counter--;

      const temp = arr[counter];
      arr[counter] = arr[index];
      arr[index] = temp;
    }

    return arr;
  };

  const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

  const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const startRow = Math.floor(Math.random() * cellsVertical);
  const startColumn = Math.floor(Math.random() * cellsHorizontal);

  const stepThroughCell = (row, column) => {
    // if i have visited  the cell at [raw, column], then return
    if (grid[row][column]) {
      return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
      [row - 1, column, 'up'],
      [row, column + 1, 'right'],
      [row + 1, column, 'down'],
      [row, column - 1, 'left']
    ]);
    // console.log(neighbors);

    // for each neighbor....
    for (let neighbor of neighbors) {
      const [nextRow, nextColumn, direction] = neighbor;

      // See if that neighbor is out of bounds
      if (
        nextRow < 0 ||
        nextRow >= cellsVertical ||
        nextColumn < 0 ||
        nextColumn >= cellsHorizontal
      ) {
        continue;
      }

      // If we have visited that neighbor, continue to next neighbor
      if (grid[nextRow][nextColumn]) {
        continue;
      }

      // Remove a wall from either horizontals or verticals
      if (direction === 'left') {
        verticals[row][column - 1] = true;
      } else if (direction === 'right') {
        verticals[row][column] = true;
      } else if (direction === 'up') {
        horizontals[row - 1][column] = true;
      } else if (direction === 'down') {
        horizontals[row][column] = true;
      }

      // visit that next cell
      stepThroughCell(nextRow, nextColumn);
    }
  };

  stepThroughCell(startRow, startColumn);

  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX / 2,
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        5,
        {
          label: 'wall',
          isStatic: true,
          render: {
            fillStyle: 'grey'
          }
        }
      );
      World.add(world, wall);
    });
  });

  verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX,
        rowIndex * unitLengthY + unitLengthY / 2,
        10,
        unitLengthY,
        {
          label: 'wall',
          isStatic: true,
          render: {
            fillStyle: 'grey'
          }
        }
      );
      World.add(world, wall);
    });
  });

  // Goal
  const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
      isStatic: true,
      label: 'goal',
      render: {
        fillStyle: '#D07CA8'
      }
    }
  );
  World.add(world, goal);

  // Ball
  const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
  const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: 'ball',
    render: {
      fillStyle: '#7CA1D0'
    }
  });
  World.add(world, ball);

  document.addEventListener('keydown', e => {
    const { x, y } = ball.velocity;

    // up
    if (e.keyCode === 38) {
      Body.setVelocity(ball, { x, y: y - 5 });
    }
    // down
    if (e.keyCode === 40) {
      Body.setVelocity(ball, { x, y: y + 5 });
    }
    // right
    if (e.keyCode === 39) {
      Body.setVelocity(ball, { x: x + 5, y });
    }

    // left
    if (e.keyCode === 37) {
      Body.setVelocity(ball, { x: x - 5, y });
    }
  });

  // Win Condition

  Events.on(engine, 'collisionStart', e => {
    e.pairs.forEach(collision => {
      const labels = ['ball', 'goal'];

      if (
        labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)
      ) {
        document.querySelector('.winner').classList.remove('hidden');
        world.gravity.y = 1;
        world.bodies.forEach(body => {
          if (body.label === 'wall') {
            Body.setStatic(body, false);
          }
        });
      }
    });
  });
}
start();

// New Game

const btn = document.querySelector('button');

btn.addEventListener('click', e => {
  event.preventDefault();
  World.clear(world);
  Engine.clear(engine);
  console.log('reset clicked');

  document.querySelector('.winner').classList.add('hidden');
  start();
});
