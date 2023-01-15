import { CSSResult, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";

import { style } from "./styles";

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "portail-card",
  name: "Portail",
  preview: false,
  description: "",
});
/* eslint-enable @typescript-eslint/no-explicit-any */

interface CardConfig {
  opt: string;
}

@customElement("portail-card")
export default class PortailCard extends LitElement {
  private _hass?: HomeAssistant;
  private _config?: CardConfig;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
  }

  setConfig(config: CardConfig) {
    this._config = config;
  }

  static get styles(): CSSResult {
    return style;
  }

  private _render(): TemplateResult<1> {
    return html`
      <ha-card elevation="2" style="">
        <div class="card-header">
          Title
          <div class="entities-info-row">
            cfg: ${JSON.stringify(this._config)}
          </div>
        </div>
      </ha-card>
    `;
  }

  render(): TemplateResult<1> {
    if (!this._hass || !this._config) return html``;

    try {
      return this._render();
    } catch (error) {
      return html`<hui-warning>${error.toString()}</hui-warning>`;
    }
  }

  getCardSize() {
    return 3;
  }
}
