export default function createLoadingMatrix() {
  // Coordonnees (x, y), avec (0, 0) en bas a gauche.
  const firstFrame = ["0,0", "0,1", "1,1", "0,2", "1,2", "2,2"];
  const secondFrame = ["0,2", "1,2", "1,1", "2,2", "2,1", "2,0"];
  const matrix = document.createElement("span");
  matrix.className = "loading-matrix";
  matrix.setAttribute("role", "status");
  matrix.setAttribute("aria-label", "Reponse en cours");

  // Le CSS Grid se remplit de haut en bas : y = 2 d'abord.
  for (let y = 2; y >= 0; y--) {
    for (let x = 0; x < 3; x++) {
      const point = `${x},${y}`;
      const dot = document.createElement("span");
      dot.className = "loading-dot";
      dot.setAttribute("aria-hidden", "true");
      if (firstFrame.includes(point) && secondFrame.includes(point)) {
        dot.classList.add("loading-dot--both");
      } else if (firstFrame.includes(point)) {
        dot.classList.add("loading-dot--first");
      } else if (secondFrame.includes(point)) {
        dot.classList.add("loading-dot--second");
      }
      matrix.append(dot);
    }
  }

  return matrix;
}
