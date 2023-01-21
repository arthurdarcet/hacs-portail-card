import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UA, WebSocketInterface } from "jssip";
import { RTCSessionEvent } from "jssip/lib/UA";
import { RTCSession } from "jssip/lib/RTCSession";

let phone: UA = null; // global, we should only have one

@customElement("portail-card-phone")
export class Phone extends LitElement {
  @property({ type: String }) public uri: string;
  @property({ type: String }) public aor: string;
  @property({ type: String }) public username: string;
  @property({ type: String }) public password: string;

  @property({ attribute: false }) private btn_accept_visible = false;
  @property({ attribute: false }) private btn_reject_visible = false;
  @property({ attribute: false }) private btn_endcall_visible = false;

  private session?: RTCSession;
  private audio_elements?: HTMLAudioElement[];

  private on_rtc_session({ session }: RTCSessionEvent) {
    if (session.direction != "incoming") {
      return;
    }

    this.session = session;
    this.audio_elements = [];

    this.btn_accept_visible = true;
    this.btn_reject_visible = true;

    session.on("accepted", () => this.on_call_accepted());
    session.on("ended", () => this.on_call_ended());
    session.on("failed", () => this.on_call_ended());
    session.on("peerconnection", () => {
      session.connection.addEventListener(
        "addstream",
        (e) => this.on_peer_stream((e as any).stream) // eslint-disable-line @typescript-eslint/no-explicit-any
      );
    });

    this.dispatchEvent(new CustomEvent("call-started", {}));
  }

  private on_peer_stream(stream: MediaProvider) {
    const el = document.createElement("audio");
    this.audio_elements.push(el);
    el.srcObject = stream;
    el.play();
  }

  private on_call_accepted() {
    this.btn_accept_visible = false;
    this.btn_reject_visible = false;
    this.btn_endcall_visible = true;
  }

  private on_call_ended() {
    this.btn_accept_visible = false;
    this.btn_reject_visible = false;
    this.btn_endcall_visible = false;

    this.audio_elements.forEach((el) => el.remove());
    this.audio_elements = null;
    this.session = null;

    this.dispatchEvent(new CustomEvent("call-ended", {}));
  }

  private on_btn_accept_clicked() {
    this.session.answer({ mediaConstraints: { audio: true, video: false } });
  }
  private on_btn_reject_clicked() {
    this.session.terminate();
  }
  private on_btn_endcall_clicked() {
    this.session.terminate();
  }

  render(): TemplateResult<1> {
    if (!phone) {
      phone = new UA({
        sockets: [new WebSocketInterface(this.uri)],
        uri: this.aor,
        authorization_user: this.username,
        password: this.password,
      });

      phone.on("registered", () =>
        console.log("SIPPhone registered with SIP Server")
      );
      phone.on("newRTCSession", (data) => this.on_rtc_session(data));
      phone.start();
    }

    return html`
      <div>
        <mwc-button
          @click=${() => this.on_btn_accept_clicked()}
          raised
          style="${!this.btn_accept_visible ? "display: none" : ""}"
        >
          Répondre
        </mwc-button>
        <mwc-button
          @click=${() => this.on_btn_reject_clicked()}
          raised
          style="${!this.btn_reject_visible ? "display: none" : ""}"
        >
          Rejeter
        </mwc-button>
        <mwc-button
          @click=${() => this.on_btn_endcall_clicked()}
          raised
          style="${!this.btn_endcall_visible ? "display: none" : ""}"
        >
          Raccrocher
        </mwc-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    phone: Phone;
  }
}
