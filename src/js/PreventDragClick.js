export class PreventDragClick {
  constructor(elem) {
    this.moveMoved;
    let clickStartX;
    let clickStartY;
    let clickStartTime;

    elem.addEventListener('mousedown', (e) => {
      this.mouseMoved = true;
      
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      clickStartTime = Date.now();
    });

    elem.addEventListener('mouseup', (e) => {
      const xGap = Math.abs(e.clientX - clickStartX);
      const yGap = Math.abs(e.clientY - clickStartY);
      const timeGap = Date.now() - clickStartTime;

      if (xGap > 5 || yGap > 5 || timeGap > 500) {
        this.mouseMoved = true;
      } else {
        this.mouseMoved = false;
      }
    });
  }
}
