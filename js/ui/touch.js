import { input } from '../core/input.js';

export class TouchControls {
    setup() {
        const controls = document.getElementById('touch-controls');
        const zone = document.getElementById('joystick-zone');
        const knob = document.getElementById('joystick-knob');
        let touchId = null;
        let centerX = 0, centerY = 0;
        let fadeTimer = null;

        const wake = () => {
            controls?.classList.add('controls-active');
            clearTimeout(fadeTimer);
        };
        const settle = () => {
            clearTimeout(fadeTimer);
            fadeTimer = setTimeout(() => controls?.classList.remove('controls-active'), 650);
        };

        zone.addEventListener('touchstart', e => {
            e.preventDefault();
            wake();
            const t = e.changedTouches[0];
            touchId = t.identifier;
            const rect = zone.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
            input.joystickActive = true;
            this.updateJoystick(t, centerX, centerY);
        });

        zone.addEventListener('touchmove', e => {
            e.preventDefault();
            wake();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    this.updateJoystick(e.changedTouches[i], centerX, centerY);
                }
            }
        });

        const resetJoy = e => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    touchId = null;
                    input.joystickActive = false;
                    input.setTouchJoystick(0, 0);
                    knob.style.transform = 'translate(-50%, -50%)';
                    settle();
                }
            }
        };

        zone.addEventListener('touchend', resetJoy);
        zone.addEventListener('touchcancel', resetJoy);

        const bindBtn = (id, code) => {
            const btn = document.getElementById(id);
            btn.addEventListener('touchstart', e => {
                e.preventDefault();
                wake();
                input.setTouchButton(code, true);
            });
            const up = e => {
                e.preventDefault();
                input.setTouchButton(code, false);
                settle();
            };
            btn.addEventListener('touchend', up);
            btn.addEventListener('touchcancel', up);
        };

        bindBtn('btn-a', 'Space');
        bindBtn('btn-b', 'KeyZ');
        bindBtn('btn-x', 'KeyX');
        bindBtn('btn-y', 'KeyC');

        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.addEventListener('touchstart', e => {
                e.preventDefault();
                wake();
                input.setTouchButton('Escape', true);
            });
            pauseBtn.addEventListener('touchend', e => {
                e.preventDefault();
                input.setTouchButton('Escape', false);
                settle();
            });
        }

        settle();
    }

    updateJoystick(t, centerX, centerY) {
        const knob = document.getElementById('joystick-knob');
        let dx = t.clientX - centerX;
        let dy = t.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const max = 40;
        if (dist > max) {
            dx = (dx / dist) * max;
            dy = (dy / dist) * max;
        }
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        input.setTouchJoystick(dx / max, dy / max);
    }
}

export const touch = new TouchControls();
