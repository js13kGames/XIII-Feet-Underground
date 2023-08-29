import { Renderer, RenderEngineParams } from "../Engine/Renderer.ts";
import { InputManager } from "../Engine/InputManager.ts";
import { Player } from "../Engine/Player/Player.ts";
import { CollisionManager } from "../Engine/CollisionManager.ts";
import { SceneManager } from "../Engine/Scene/SceneManager.ts";
import { GameState } from "../Engine/GameState.ts";
import { GameWorldState, getWorldState } from "./WorldState.ts";
import { PLAYER_INITIAL_POS, createJailScene } from "./Scenes/Jail/Jail.ts";
import { convertTileVecToGlobal } from "../Engine/utils.ts";
import { CONFIG } from "../Engine/config.ts";
import { createJailTunnel } from "./Scenes/JailTunnel/JailTunnel.ts";

const createGameState = () =>
  new GameState(
    new InputManager(),
    new SceneManager([createJailScene(), createJailTunnel()]),
    new CollisionManager(),
    getWorldState()
  );

const createPlayer = (state: GameState) =>
  new Player(state, PLAYER_INITIAL_POS, [1, 1]);

export class Game extends Renderer {
  player: Player;
  state: GameState<GameWorldState>;

  constructor(
    readonly gameCanvas: HTMLCanvasElement,
    readonly textCanvas: HTMLCanvasElement,
    readonly options: RenderEngineParams = {}
  ) {
    super(gameCanvas, textCanvas, options);

    this.state = createGameState();

    this.player = createPlayer(this.state);
  }

  private renderUI() {
    const items = [...this.state.worldState.items.values()];

    this.drawText(
      `Items: ${items.reduce(
        (p, n, i) => p + (i !== 0 && i !== items.length ? " | " : "") + n,
        ""
      )}`,
      "m",
      ...convertTileVecToGlobal([1, CONFIG.height - 0.5]),
      { anchor: "left" }
    );
  }

  private update() {
    if (this.state.worldState.isDead) {
      if (!this.player.isKilled) {
        this.player.kill();
      }

      if (this.state.inputManager.keysPressed.has("r")) {
        this.restart();
      }

      return;
    }

    this.state.sceneManager.update(this.state);
    this.player.update(this.state);

    this.state.collisionManager.handle(
      this.player,
      this.state.sceneManager.scene
    );
  }

  private restart() {
    this.state = createGameState();
    this.player = createPlayer(this.state);
  }

  private render() {
    if (this.state.worldState.isDead) {
      this.renderRect({
        color: "#000000aa",
        anchor: "topLeft",
      });

      this.drawText("You are dead", "l", this.width / 2, this.height / 2, {
        color: "#ff0000",
      });

      this.drawText(
        "Press R to restart",
        "m",
        this.width / 2,
        this.height / 2 + 10,
        {
          color: "#ffffff",
        }
      );
    } else {
      this.state.sceneManager.render(this as Renderer);

      this.renderUI();
    }

    this.player.render(this as Renderer);
  }

  loop(): void {
    this.update();
    this.render();
  }
}
