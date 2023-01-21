import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";

import "./phone";

interface CardConfig extends LovelaceCardConfig {
  camera: string;
  open_service: string;
  users: Array<{
    hass_name: string;
    sip_uri: string;
    sip_aor: string;
    sip_username: string;
    sip_password: string;
  }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "portail-card",
  name: "Portail",
  description: "",
});
/* eslint-enable @typescript-eslint/no-explicit-any */

@customElement("portail-card")
export default class PortailCard extends LitElement {
  @property({ attribute: false }) public hass: HomeAssistant;
  @property({ attribute: false }) private config: CardConfig;
  @property({ attribute: false, reflect: true }) private in_call: boolean;

  setConfig(config: CardConfig) {
    this.config = config;
  }

  private on_btn_open_clicked() {
    this.hass.callService("", this.config.open_service);
  }

  render(): TemplateResult<1> {
    if (!this.hass || !this.config) return html``;

    const camera = this.config.camera;
    const sip_config = this.config.users.find(
      (cfg) => cfg.hass_name.toLowerCase() == this.hass.user.name.toLowerCase()
    );

    const cam_token = this.hass.states[camera].attributes["access_token"];
    const cam_url = `/api/camera_proxy_stream/${camera}?token=${cam_token}`;

    let css = "overflow: hidden;";
    if (this.in_call) {
      css += [
        "position: absolute;",
        "top: 40px;",
        "left: 40px;",
        "bottom: 40px;",
        "right: 40px;",
        "z-index: 10000;",
      ].join(" ");
    }

    let phone = null;
    if (sip_config) {
      phone = html`<portail-card-phone
        uri=${sip_config.sip_uri}
        aor=${sip_config.sip_aor}
        username=${sip_config.sip_username}
        password=${sip_config.sip_password}
        @call-started=${() => (this.in_call = true)}
        @call-ended=${() => (this.in_call = false)}
        style="width: 100%; display: flex; justify-content: end;"
      />`;
    }

    return html`
      <ha-card style=${css}>
        <img
          id="camera"
          src=${cam_url}
          style="display: block; max-width: 100%; max-height: calc(100% - 52px); margin: auto;"
        />
        <div style="display: flex; padding: 8px;">
          <mwc-button @click=${() => this.on_btn_open_clicked()} raised>
            Ouvrir
          </mwc-button>
          ${phone}
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 1;
  }
}
