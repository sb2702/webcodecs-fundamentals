export class LogoRenderer {
  constructor(logoPath, ctx) {
    this.ctx = ctx;
    this.logo = new Image();
    this.logoLoaded = false;
    this.logoWidth = 120;  // Scaled down from 600x170
    this.logoHeight = 34;   // Maintain aspect ratio
    this.padding = 10;

    this.logo.src = logoPath;

  }

  draw() {


    const canvasWidth = this.ctx.canvas.width;
    const x = canvasWidth - this.logoWidth - this.padding;
    const y = this.padding;

    this.ctx.drawImage(
      this.logo,
      x, y,
      this.logoWidth,
      this.logoHeight
    );
  }
}
