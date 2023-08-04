import { CriticalitySimulation } from "./simulations/criticality.js";

function setup() {
  let screenWidth = 1000;
  let screenHeight = 1000;
  const canvas = createCanvas(screenWidth, screenHeight);
  canvas.parent("draw");
  noLoop();

  let particleSimulation = new CriticalitySimulation(screenWidth, screenHeight);

  let simulation;
  document.getElementById("start").onclick = () => {
    if (!!simulation) simulation.stop();
    const density = document.getElementById("density").value;
    simulation = particleSimulation.getSimulation(density);
    simulation.start();
  };

  const ctx = document.getElementById("chart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [1, 2, 3, 4, 5, 6],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

window.setup = setup;
