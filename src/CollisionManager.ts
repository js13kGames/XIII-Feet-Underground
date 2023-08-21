import { BaseEntity } from "./BaseEntity.ts";
import { Player } from "./Player.ts";
import {
  OpaqueCollisionEvent,
  SolidCollisionEvent,
  WallCollisionEvent,
  observer,
} from "./Observer.ts";
import { Direction } from "./types.ts";
import { CONFIG } from "./config.ts";

export class CollisionManager {
  static handleWallsCollision(player: Player) {
    // TODO: optimize for rectangles?
    const halfW = player.dim[0] / 2;
    const halfH = player.dim[1] / 2;

    let direction: Direction | undefined = undefined;

    if (player.pos[0] - halfW < 0) {
      direction = "l";

      player.pos[0] = 0 + halfW;
    } else if (player.pos[0] + halfW > CONFIG.width) {
      direction = "r";

      player.pos[0] = CONFIG.width - halfW;
    } else if (player.pos[1] - halfH < 0) {
      direction = "t";

      player.pos[1] = 0 + halfH;
    } else if (player.pos[1] + halfH > CONFIG.height) {
      direction = "d";

      player.pos[1] = CONFIG.height - halfH;
    }

    if (direction) {
      const event = {
        name: "wall-collision",
        data: {
          direction: direction,
        },
      } as WallCollisionEvent;

      observer.emitEvent(event);
    }
  }

  static handleEntityCollisions(player: Player, entities: BaseEntity[]) {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];

      const { collisionType } = entity;

      if (collisionType === "none") {
        continue;
      }

      const areColliding =
        player.pos[0] <= entity.pos[0] + entity.dim[0] &&
        player.pos[0] + player.dim[0] >= entity.pos[0] &&
        player.pos[1] <= entity.pos[1] + entity.dim[1] &&
        player.pos[1] + player.dim[1] >= entity.pos[1];

      if (!areColliding) continue;

      const directions: Direction[] = [];

      const dx = player.pos[0] - entity.pos[0];
      const dw = player.dim[0] / 2 + entity.dim[0] / 2;

      if (Math.abs(Math.abs(dx) - Math.abs(dw)) < player.velocity) {
        const dir = dx > 0 ? "l" : "r";

        directions.push(dir);

        if (collisionType === "solid") {
          player.pos[0] = entity.pos[0] + (dir === "l" ? 1 : -1) * (dw + 1);
        }
      }

      const dy = player.pos[1] - entity.pos[1];
      const dh = player.dim[1] / 2 + entity.dim[1] / 2;

      if (Math.abs(Math.abs(dy) - Math.abs(dh)) < player.velocity) {
        const dir = dy > 0 ? "t" : "d";

        directions.push(dir);

        if (collisionType === "solid") {
          player.pos[1] = entity.pos[1] + (dir === "t" ? 1 : -1) * (dw + 1);
        }
      }

      if (collisionType === "solid") {
        observer.emitEvent({
          name: "solid-collision",
          data: {
            entity,
            directions,
          },
        } as SolidCollisionEvent);
      }

      if (collisionType === "opaque") {
        observer.emitEvent({
          name: "opaque-collision",
          data: {
            entity,
          },
        } as OpaqueCollisionEvent);
      }
    }
  }
}
