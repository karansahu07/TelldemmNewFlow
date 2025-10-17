// src/app/settings/chats/theme/theme.page.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { ThemeService, ChatTheme } from '../../../../services/theme.service';
import { ToastController, AnimationController, PopoverController, IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService,ChatTheme } from 'src/app/services/theme';

const PRESET_BUBBLES = [
  { me: '#DCF8C6', other: '#FFFFFF' },
  { me: '#00A884', other: '#EDEDED' },
  { me: '#E1FFC7', other: '#F0F0F0' },
  { me: '#CDE7FF', other: '#FFFFFF' },
  { me: '#FFD6A5', other: '#FFF' },
];

const PRESET_GRADIENTS = [
  { id: 'g1', css: 'linear-gradient(135deg,#84fab0 0%,#8fd3f4 100%)' },
  { id: 'g2', css: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)' },
  { id: 'g3', css: 'linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)' },
  { id: 'g4', css: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' },
];

const PRESET_WALLS = [
  { id: 'wp1', url: 'assets/wallpapers/wp1.jpg' },
  { id: 'wp2', url: 'assets/wallpapers/wp2.jpg' },
  { id: 'wp3', url: 'assets/wallpapers/wp3.jpg' },
];
@Component({
  selector: 'app-theme',
  templateUrl: './theme.page.html',
  styleUrls: ['./theme.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],

})
export class ThemePage implements OnInit {

  @ViewChild('preview', { static: true }) previewRef!: ElementRef<HTMLElement>;

  theme: ChatTheme;
  bubblePresets = PRESET_BUBBLES;
  gradients = PRESET_GRADIENTS;
  wallpapers = PRESET_WALLS;

  // small ephemeral list of saved presets
  savedPresets: ChatTheme[] = [];

  constructor(
    private themeSvc: ThemeService,
    private toastCtrl: ToastController,
    private animCtrl: AnimationController
  ) {
    this.theme = this.themeSvc.load();
  }

  ngOnInit() {
    // ensure live theme applied to preview area
    this.themeSvc.apply(this.theme);
  }

  // user picks bubble colors
  pickBubble(me: string, other?: string) {
    this.theme.meBubble = me;
    if (other) this.theme.otherBubble = other;
    this.theme.bubbleTextColorMe = this.themeSvc.pickTextColor(me);
    this.theme.bubbleTextColorOther = this.themeSvc.pickTextColor(this.theme.otherBubble);
    this.livePreview();
  }

  // gradient / wallpaper / solid picks
  pickGradient(css: string) {
    this.theme.backgroundType = 'gradient';
    this.theme.backgroundValue = css;
    this.livePreview();
  }

  pickWallpaper(url: string) {
    this.theme.backgroundType = 'wallpaper';
    this.theme.backgroundValue = url;
    this.livePreview();
  }

  pickSolid(hex: string) {
    this.theme.backgroundType = 'solid';
    this.theme.backgroundValue = hex;
    this.livePreview();
  }

  // file upload handler (resizes recommended to avoid huge dataurls)
  onFilePicked(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      // reader.result is dataURL
      this.theme.backgroundType = 'custom';
      this.theme.backgroundValue = reader.result as string;
      this.livePreview();
    };
    reader.readAsDataURL(file);
  }

  // apply live with short animation to the preview area
  livePreview() {
    // animate preview (pulse)
    const el = this.previewRef.nativeElement;
    const anim = this.animCtrl
      .create()
      .addElement(el)
      .duration(260)
      .easing('ease-out')
      .fromTo('transform', 'scale(0.995)', 'scale(1)')
      .fromTo('opacity', '0.95', '1');
    anim.play();
    // apply CSS variables immediately
    this.themeSvc.apply(this.theme);
  }

  // save theme persistently with a mild page transition
  async saveTheme() {
    // ensure text colors set
    this.theme.bubbleTextColorMe = this.themeSvc.pickTextColor(this.theme.meBubble);
    this.theme.bubbleTextColorOther = this.themeSvc.pickTextColor(this.theme.otherBubble);
    this.themeSvc.save(this.theme);
    this.themeSvc.applyWithTransition(this.theme, 360);
    const t = await this.toastCtrl.create({ message: 'Theme saved', duration: 900, position: 'bottom' });
    await t.present();
  }

  // randomize button
  surpriseMe() {
    this.theme = this.themeSvc.randomTheme();
    this.livePreview();
  }

  // save a quick custom preset (in-memory)
  savePreset() {
    this.savedPresets.unshift({ ...this.theme });
    if (this.savedPresets.length > 8) this.savedPresets.pop();
  }

  // long-press preview full-screen (simple toggle)
  previewFullScreen() {
    const el = document.createElement('div');
    el.className = 'full-wall-preview';
    el.innerHTML = `<div class="close">✕</div>`;
    el.style.background = this.theme.backgroundType === 'solid' ? this.theme.backgroundValue :
                          this.theme.backgroundType === 'gradient' ? this.theme.backgroundValue :
                          `url("${this.theme.backgroundValue}") center/cover no-repeat`;
    el.onclick = () => document.body.removeChild(el);
    document.body.appendChild(el);
  }

}
