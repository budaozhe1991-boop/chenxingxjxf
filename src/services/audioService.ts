/**
 * Simple Audio Manager for the game
 */

class AudioManager {
  private bgMusic: HTMLAudioElement | null = null;
  private sounds: Record<string, HTMLAudioElement> = {};
  private volume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      // Background music placeholder (Royalty free space ambient)
      this.bgMusic = new Audio('https://assets.mixkit.co/music/preview/mixkit-deep-space-ambient-944.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.volume = this.volume;

      // Sound effects placeholders
      this.sounds = {
        shoot: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-laser-weapon-shot-1681.mp3'),
        explosion: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-short-explosion-1694.mp3'),
        powerup: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-in-video-game-2058.mp3'),
        gameover: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3'),
        bomb: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-explosion-with-debris-2188.mp3'),
        laser: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-plasma-gun-shot-1676.mp3'),
        boss: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cinematic-mystery-impact-2185.mp3'),
        hit: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-heavy-impact-2186.mp3')
      };

      Object.values(this.sounds).forEach(s => {
        s.volume = this.volume;
      });
    }
  }

  setVolume(value: number) {
    this.volume = value;
    if (this.bgMusic) this.bgMusic.volume = value;
    Object.values(this.sounds).forEach(s => {
      s.volume = value;
    });
  }

  getVolume() {
    return this.volume;
  }

  playMusic() {
    if (this.bgMusic) {
      this.bgMusic.play().catch(e => console.log("Audio play blocked by browser", e));
    }
  }

  pauseMusic() {
    if (this.bgMusic) this.bgMusic.pause();
  }

  playSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      // Clone to allow overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(e => {});
    }
  }
}

export const audioManager = new AudioManager();
