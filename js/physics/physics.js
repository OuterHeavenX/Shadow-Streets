export class PhysicsSystem {
    checkAABB(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
    
    resolveFloor(entity) {
        const floorY = 500; 
        if (entity.y + entity.height > floorY) {
            entity.y = floorY - entity.height;
            entity.vy = 0;
            entity.isGrounded = true;
        }
    }
}
export const physics = new PhysicsSystem();