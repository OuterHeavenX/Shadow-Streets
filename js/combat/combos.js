// Light-attack combo tracker. Three light hits chained within the timing
// window make the third an uppercut launcher. A heavy attack while the target
// is airborne becomes a slam.
export class ComboSystem {
    constructor() {
        this.count = 0;
        this.window = 0;      // time remaining to continue the chain
        this.windowMax = 0.6; // seconds between light hits
    }

    // Called when a light attack CONNECTS. Returns the resulting combo info.
    registerLight() {
        if (this.window > 0) {
            this.count++;
        } else {
            this.count = 1;
        }
        this.window = this.windowMax;

        const step = ((this.count - 1) % 3) + 1; // 1,2,3,1,2,3...
        return {
            count: this.count,
            step,
            isLauncher: step === 3
        };
    }

    // Heavy attack info — slam when target airborne.
    registerHeavy(targetAirborne) {
        // Heavy resets the light chain but continues the visible counter.
        this.count = 0;
        this.window = 0;
        return { isSlam: !!targetAirborne };
    }

    update(dt) {
        if (this.window > 0) {
            this.window -= dt;
            if (this.window <= 0) {
                this.count = 0;
            }
        }
    }

    reset() {
        this.count = 0;
        this.window = 0;
    }
}

// Legacy named export kept for compatibility.
export const ComboSystem_default = ComboSystem;
