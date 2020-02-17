const { Engine, Render, Runner, World, Bodies } = Matter;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 800,
    height: 600
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [Bodies.rectangle(400, 0, 800, 40, { isStatic: true })];
World.add(world, walls);
