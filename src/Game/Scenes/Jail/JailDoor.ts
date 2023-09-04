import { BaseEntity, EntityKey } from "../../../Engine/BaseEntity";
import { BaseInteractionComponent } from "../../../Engine/Components/InteractionComponent";
import { ImageRenderComponent } from "../../../Engine/Components/RenderComponent";
import { GameState } from "../../../Engine/GameState";
import { Renderer } from "../../../Engine/Renderer/Renderer";
import { Vec2 } from "../../../Engine/types";
import { IMAGES_KEY } from "../../../assets";
import { GameWorldState } from "../../WorldState";
import { createOffsetPositionComponent } from "../../helpers";
import { CELL_KEY } from "../../items";

class DoorInteractionComponent extends BaseInteractionComponent<GameWorldState> {
  private _isOpen: boolean = false;
  private _hasKey: boolean = false;

  update(entity: BaseEntity, state: GameState<GameWorldState>): void {
    super.update(entity, state);

    this._hasKey = state.worldState.items.has(CELL_KEY.key);

    if (this.state === "active" && this._hasKey) {
      this._isOpen = true;
    }
  }

  render(entity: BaseEntity, renderer: Renderer): void {
    if (this._hasKey) {
      super.render(entity, renderer);
    }
  }

  get isOpen() {
    return this._isOpen;
  }
}

export class JailDoor extends BaseEntity {
  static CLOSED_COLOR = "#fd0000";
  static OPEN_COLOR = "#00fd00";

  constructor(
    key: EntityKey,
    pos: Vec2,
    dir?: "l" | "r",
    readonly onOpen?: (ws: GameWorldState) => void
  ) {
    super(
      {
        position: createOffsetPositionComponent(pos, [1, 1], dir),
        collision: { type: "interactable" },
        render: new ImageRenderComponent(IMAGES_KEY.jailDoor),
        interaction: new DoorInteractionComponent(),
      },
      key
    );
  }

  update(state: GameState<GameWorldState>): void {
    const i = this.components.interaction! as DoorInteractionComponent;

    i.update!(this, state);

    if (i.isOpen) {
      this.components.collision!.type = "none";
      this.components.render = undefined;

      this.onOpen?.(state.worldState);
    }
  }

  render(renderer: Renderer): void {
    super.render(renderer);

    this.components.interaction!.render!(this, renderer);
  }
}
