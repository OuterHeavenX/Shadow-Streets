export class PhysicsSystem {
    checkAABB(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    resolveStreet(entity, world) {
        const district = world && world.district;
        if (!district) return;

        const streetTop = district.streetTop ?? 345;
        const streetBottom = district.streetBottom ?? 545;
        const feetY = entity.y + entity.height;

        if (feetY < streetTop) {
            entity.y = streetTop - entity.height;
            entity.depthVy = Math.max(0, entity.depthVy || 0);
        }
        if (feetY > streetBottom) {
            entity.y = streetBottom - entity.height;
            entity.depthVy = Math.min(0, entity.depthVy || 0);
        }

        if (entity.x < 0) {
            entity.x = 0;
            entity.vx = Math.max(0, entity.vx);
        }
        if (entity.x + entity.width > district.width) {
            entity.x = district.width - entity.width;
            entity.vx = Math.min(0, entity.vx);
        }
    }

    // Kept for older callers. Jump landing is now handled on Entity.z.
    resolveFloor(entity) {
        if (entity.z <= 0) {
            entity.z = 0;
            entity.vy = 0;
            entity.isGrounded = true;
        }
    }
}
export const physics = new PhysicsSystem();