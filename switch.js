
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");

    // Grab the three elements
    const leftImage = document.getElementById("leftImage");
    const canvasEl  = document.getElementById("canvas");
    const rightImage = document.getElementById("rightImage");

    // Put them in an array so it's easier to reorder
    let elements = [leftImage, canvasEl, rightImage];

    // Add a click event to the window
    window.addEventListener("click", () => {
      /*// Move the rightmost element to the front
      elements.unshift(elements.pop());

      // Clear the container
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Append the elements in their new order
      elements.forEach(el => container.appendChild(el));
      */
      switchActive = true;
    });
  });