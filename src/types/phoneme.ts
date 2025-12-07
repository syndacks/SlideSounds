export interface PhonemeZone {
  letter: string;
  startX: number;
  endX: number;
  phoneme: string;
}

export interface PhonemeMap {
  [letter: string]: string;
}

export interface AudioBufferMap {
  [phoneme: string]: AudioBuffer;
}
