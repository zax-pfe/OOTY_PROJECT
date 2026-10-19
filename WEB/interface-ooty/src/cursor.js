export default function setupCursor(input, cursor) {
  const context = document.createElement("canvas").getContext("2d");

  function updateCursor() {
    const style = getComputedStyle(input);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    const text = input.value.slice(0, input.selectionStart);
    const start = parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
    const end = input.offsetWidth - parseFloat(style.borderRightWidth) - cursor.offsetWidth;
    const position = start + context.measureText(text).width - input.scrollLeft;

    cursor.style.left = `${Math.max(start, Math.min(position, end))}px`;
    cursor.hidden = input.selectionStart !== input.selectionEnd;
  }

  // Attendre que le navigateur ait deplace le texte dans le champ.
  const scheduleUpdate = () => requestAnimationFrame(updateCursor);
  for (const event of ["input", "keyup", "click", "select", "scroll", "focus"]) {
    input.addEventListener(event, scheduleUpdate);
  }
  document.addEventListener("selectionchange", () => {
    if (document.activeElement === input) scheduleUpdate();
  });
  document.fonts.ready.then(scheduleUpdate);
  scheduleUpdate();
}
