import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';

export class RendererManager {
    constructor() {
        this.app = null;
    }
    async init(containerId) {
        this.app = new PIXI.Application();
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0a0a0f,
            resizeTo: window,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        document.getElementById(containerId).appendChild(this.app.canvas);
        
        this.worldContainer = new PIXI.Container();
        this.bgContainer = new PIXI.Container();
        this.mgContainer = new PIXI.Container();
        this.fgContainer = new PIXI.Container();
        this.uiContainer = new PIXI.Container();
        
        this.worldContainer.addChild(this.bgContainer);
        this.worldContainer.addChild(this.mgContainer);
        this.worldContainer.addChild(this.fgContainer);
        
        this.app.stage.addChild(this.worldContainer);
        this.app.stage.addChild(this.uiContainer);
        
        this.app.ticker.stop();
    }
    
    render() {
        this.app.renderer.render(this.app.stage);
    }
}
export const renderer = new RendererManager();