import { CanvasRenderer, RenderEngineParams } from "./CanvasRenderer.ts";
import { InputManager } from "./InputKey.ts";
import { Player } from "./Player.ts";
import { observer } from "./Observer.ts";
import { SceneManager } from "./SceneManager.ts";
import { CollisionManager } from "./CollisionManager.ts";

class Camera {
  constructor(private readonly game: Game) {}
}

export class Game extends CanvasRenderer {
  _player: Player;
  _camera: Camera;
  _inputManager: InputManager;
  _sceneManager: SceneManager;

  constructor(canvas: HTMLCanvasElement, options: RenderEngineParams = {}) {
    super(canvas, options);

    this._inputManager = new InputManager();

    this._camera = new Camera(this);
    this._player = new Player(this, [this.width / 2, this.height / 2]);

    this._sceneManager = new SceneManager(this);
  }

  private update() {
    this._player.update(this._inputManager.keysPressed);

    this._sceneManager.update(this._inputManager.keysPressed);

    CollisionManager.handleEntityCollisions(this._player, [
      ...this._sceneManager.chamber.children,
    ]);

    CollisionManager.handleWallsCollision(this._player);
  }

  private render() {
    this._sceneManager.render(this.ctx);

    this._player.render(this.ctx);
  }

  loop(): void {
    this.update();
    this.render();
  }
}
