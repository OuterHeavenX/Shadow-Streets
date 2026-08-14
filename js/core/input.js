export class InputManager {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this.touchAxes = { x: 0, y: 0 };
        this.touchButtons = {};
        this.joystickActive = false;

        window.addEventListener('keydown', e => {
            if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
            this.justPressed[e.code] = true;
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });
    }

    update() {
        this.justPressed = {};
    }

    // Called by touch.js joystick
    setTouchJoystick(x, y) {
        this.touchAxes.x = x;
        this.touchAxes.y = y;
    }

    // Called by touch.js buttons
    setTouchButton(code, pressed) {
        this.touchButtons[code] = pressed;
        if (pressed) {
            this.justPressed[code] = true;
        }
    }

    isDown(code) {
        return !!this.keys[code] || !!this.touchButtons[code];
    }

    isJustPressed(code) {
        return !!this.justPressed[code];
    }

    getAxisX() {
        if (this.joystickActive) return this.touchAxes.x;
        let x = 0;
        if (this.isDown('ArrowLeft')  || this.isDown('KeyA')) x -= 1;
        if (this.isDown('ArrowRight') || this.isDown('KeyD')) x += 1;
        return x;
    }

    getAxisY() {
        if (this.joystickActive) return this.touchAxes.y;
        let y = 0;
        if (this.isDown('ArrowUp')   || this.isDown('KeyW')) y -= 1;
        if (this.isDown('ArrowDown') || this.isDown('KeyS')) y += 1;
        return y;
    }
}
export const input = new InputManager();
