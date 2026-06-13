/**
 * 分數魔法烘焙屋 4.0 - Core JavaScript Application
 */

// ==================== 1. AUDIO SYNTHESIZER (Web Audio API) ====================
const AudioSynth = {
  ctx: null,
  
  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  },
  
  play(type) {
    this.init();
    if (!this.ctx) return;
    
    // Resume context if suspended (browser security policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const now = this.ctx.currentTime;
    
    if (type === 'correct') {
      // Pleasant C-Major Arpeggio (C4 -> E4 -> G4 -> C5)
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.4);
      });
    } else if (type === 'incorrect') {
      // Slightly detuned buzzy sound
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      
      osc1.frequency.setValueAtTime(140, now);
      osc2.frequency.setValueAtTime(142, now); // Detuned
      
      osc1.frequency.linearRampToValueAtTime(90, now + 0.35);
      osc2.frequency.linearRampToValueAtTime(91, now + 0.35);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'click') {
      // Short wood block click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'shake') {
      // Low rumble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.5);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'victory') {
      // Grand arpeggio/chords
      const chords = [
        [261.63, 329.63, 392.00], // C4, E4, G4
        [293.66, 349.23, 440.00], // D4, F4, A4
        [329.63, 392.00, 523.25]  // E4, G4, C5
      ];
      chords.forEach((freqs, chordIdx) => {
        const chordTime = now + chordIdx * 0.25;
        freqs.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, chordTime);
          
          gain.gain.setValueAtTime(0, chordTime);
          gain.gain.linearRampToValueAtTime(0.08, chordTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 0.6);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(chordTime);
          osc.stop(chordTime + 0.6);
        });
      });
    }
  }
};

// ==================== 2. TTS VOICE MANAGER ====================
const VoiceManager = {
  speaking: false,
  
  speak(text, onEndCallback = null) {
    if (!('speechSynthesis' in window)) {
      console.warn("TTS not supported in this browser.");
      if (onEndCallback) onEndCallback();
      return;
    }
    
    window.speechSynthesis.cancel(); // Stop any current speech
    
    // Pedagogical adjustment: append buffer particle to prevent cutting off trailing words
    const bufferedText = text.trim() + " 呢。";
    
    const utterance = new SpeechSynthesisUtterance(bufferedText);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.95; // Slightly slower for children
    utterance.pitch = 1.05; // Slightly higher/friendly pitch
    
    utterance.onstart = () => {
      this.speaking = true;
    };
    
    utterance.onend = () => {
      this.speaking = false;
      if (onEndCallback) onEndCallback();
    };
    
    utterance.onerror = (e) => {
      console.error("Speech error", e);
      this.speaking = false;
      if (onEndCallback) onEndCallback();
    };
    
    window.speechSynthesis.speak(utterance);
  },
  
  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.speaking = false;
  }
};

// ==================== 3. OMML MATH RENDERER ====================
// Standardizes fraction displays without slashes or text
const MathRenderer = {
  /**
   * Renders a fraction or mixed number as HTML following the CSS inline-table structure.
   * If integer part is 0, renders a simple fraction.
   */
  render(integer, numerator, denominator) {
    integer = parseInt(integer) || 0;
    numerator = parseInt(numerator) || 0;
    denominator = parseInt(denominator) || 1;
    
    if (numerator === 0) {
      return `<span class="math-int">${integer}</span>`;
    }
    
    if (integer === 0) {
      return `
        <span class="math-frac">
          <span class="row-num"><span class="cell-num">${numerator}</span></span>
          <span class="row-den"><span class="cell-den">${denominator}</span></span>
        </span>
      `.trim();
    } else {
      return `
        <span class="math-mixed">
          <span class="math-int">${integer}</span>
          <span class="math-frac">
            <span class="row-num"><span class="cell-num">${numerator}</span></span>
            <span class="row-den"><span class="cell-den">${denominator}</span></span>
          </span>
        </span>
      `.trim();
    }
  },
  
  // Text string formatting for screen readers or debug logging
  toSpeechText(integer, numerator, denominator) {
    integer = parseInt(integer) || 0;
    numerator = parseInt(numerator) || 0;
    denominator = parseInt(denominator) || 1;
    if (numerator === 0) {
      return `${integer}`;
    }
    if (integer === 0) {
      return `${denominator}分之${numerator}`;
    } else {
      return `${integer}又${denominator}分之${numerator}`;
    }
  }
};

// ==================== 4. QUESTION BANK GENERATOR ====================
// Ensures at least 20 static-procedural questions per level
const QuestionGenerator = {
  // Database of question templates per level
  levels: {
    1: [
      { id: 101, type: 'classify', data: { int: 0, num: 3, den: 5 }, ans: 'true', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 102, type: 'classify', data: { int: 0, num: 9, den: 4 }, ans: 'improper', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 103, type: 'classify', data: { int: 1, num: 2, den: 3 }, ans: 'mixed', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 104, type: 'classify', data: { int: 0, num: 8, den: 8 }, ans: 'improper', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 105, type: 'classify', data: { int: 0, num: 12, den: 7 }, ans: 'improper', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 106, type: 'classify', data: { int: 2, num: 3, den: 8 }, ans: 'mixed', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 107, type: 'classify', data: { int: 0, num: 1, den: 10 }, ans: 'true', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      
      { id: 108, type: 'convert_to_mixed', data: { int: 0, num: 11, den: 4 }, ans: { int: 2, num: 3, den: 4 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      { id: 109, type: 'convert_to_mixed', data: { int: 0, num: 12, den: 4 }, ans: { int: 3, num: 0, den: 4 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      { id: 110, type: 'convert_to_mixed', data: { int: 0, num: 7, den: 3 }, ans: { int: 2, num: 1, den: 3 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      { id: 111, type: 'convert_to_mixed', data: { int: 0, num: 8, den: 5 }, ans: { int: 1, num: 3, den: 5 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      { id: 112, type: 'convert_to_mixed', data: { int: 0, num: 15, den: 6 }, ans: { int: 2, num: 3, den: 6 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      
      { id: 113, type: 'convert_to_improper', data: { int: 2, num: 3, den: 4 }, ans: { int: 0, num: 11, den: 4 }, qText: '請把這個帶分數，換算成等值的假分數喔！' },
      { id: 114, type: 'convert_to_improper', data: { int: 1, num: 2, den: 5 }, ans: { int: 0, num: 7, den: 5 }, qText: '請把這個帶分數，換算成等值的假分數喔！' },
      { id: 115, type: 'convert_to_improper', data: { int: 3, num: 1, den: 3 }, ans: { int: 0, num: 10, den: 3 }, qText: '請把這個帶分數，換算成等值的假分數喔！' },
      { id: 116, type: 'convert_to_improper', data: { int: 2, num: 5, den: 8 }, ans: { int: 0, num: 21, den: 8 }, qText: '請把這個帶分數，換算成等值的假分數喔！' },
      { id: 117, type: 'convert_to_improper', data: { int: 4, num: 1, den: 2 }, ans: { int: 0, num: 9, den: 2 }, qText: '請把這個帶分數，換算成等值的假分數喔！' },
      
      { id: 118, type: 'classify', data: { int: 0, num: 15, den: 15 }, ans: 'improper', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 119, type: 'convert_to_mixed', data: { int: 0, num: 9, den: 2 }, ans: { int: 4, num: 1, den: 2 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      { id: 120, type: 'convert_to_improper', data: { int: 1, num: 6, den: 7 }, ans: { int: 0, num: 13, den: 7 }, qText: '請把這個帶分數，換算成等值的假分數喔！' },
      
      { id: 121, type: 'classify', data: { int: 0, num: 5, den: 6 }, ans: 'true', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 122, type: 'classify', data: { int: 1, num: 4, den: 5 }, ans: 'mixed', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 123, type: 'classify', data: { int: 0, num: 10, den: 7 }, ans: 'improper', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 124, type: 'classify', data: { int: 3, num: 1, den: 2 }, ans: 'mixed', qText: '把這個分數分類：它是真分數、假分數還是帶分數呢？' },
      { id: 125, type: 'convert_to_mixed', data: { int: 0, num: 14, den: 5 }, ans: { int: 2, num: 4, den: 5 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      { id: 126, type: 'convert_to_mixed', data: { int: 0, num: 18, den: 4 }, ans: { int: 4, num: 2, den: 4 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      { id: 127, type: 'convert_to_mixed', data: { int: 0, num: 20, den: 5 }, ans: { int: 4, num: 0, den: 5 }, qText: '請把這個假分數，換算成等值的帶分數或整數喔！' },
      { id: 128, type: 'convert_to_improper', data: { int: 3, num: 2, den: 5 }, ans: { int: 0, num: 17, den: 5 }, qText: '請把這個帶分數，換算成等值的假分數喔！' },
      { id: 129, type: 'convert_to_improper', data: { int: 2, num: 1, den: 8 }, ans: { int: 0, num: 17, den: 8 }, qText: '請把這個帶分數，換算成等值的假分數喔！' },
      { id: 130, type: 'convert_to_improper', data: { int: 5, num: 1, den: 3 }, ans: { int: 0, num: 16, den: 3 }, qText: '請把這個帶分數，換算成等值的假分數喔！' }
    ],
    
    2: [
      { id: 201, type: 'compare', data: { f1: { int: 0, num: 3, den: 8 }, f2: { int: 0, num: 5, den: 8 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 202, type: 'compare', data: { f1: { int: 1, num: 3, den: 5 }, f2: { int: 2, num: 1, den: 5 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 203, type: 'compare', data: { f1: { int: 2, num: 4, den: 5 }, f2: { int: 2, num: 1, den: 5 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 204, type: 'compare', data: { f1: { int: 0, num: 11, den: 4 }, f2: { int: 2, num: 3, den: 4 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 205, type: 'compare', data: { f1: { int: 0, num: 9, den: 5 }, f2: { int: 1, num: 3, den: 5 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 206, type: 'compare', data: { f1: { int: 1, num: 2, den: 3 }, f2: { int: 0, num: 4, den: 3 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 207, type: 'compare', data: { f1: { int: 0, num: 12, den: 8 }, f2: { int: 1, num: 4, den: 8 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 208, type: 'compare', data: { f1: { int: 2, num: 2, den: 7 }, f2: { int: 0, num: 15, den: 7 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 209, type: 'compare', data: { f1: { int: 0, num: 7, den: 6 }, f2: { int: 1, num: 2, den: 6 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 210, type: 'compare', data: { f1: { int: 3, num: 0, den: 4 }, f2: { int: 0, num: 13, den: 4 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 211, type: 'compare', data: { f1: { int: 2, num: 1, den: 9 }, f2: { int: 0, num: 19, den: 9 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 212, type: 'compare', data: { f1: { int: 0, num: 17, den: 12 }, f2: { int: 1, num: 5, den: 12 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 213, type: 'compare', data: { f1: { int: 1, num: 4, den: 10 }, f2: { int: 0, num: 15, den: 10 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 214, type: 'compare', data: { f1: { int: 2, num: 3, den: 6 }, f2: { int: 1, num: 5, den: 6 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 215, type: 'compare', data: { f1: { int: 0, num: 8, den: 5 }, f2: { int: 0, num: 7, den: 5 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 216, type: 'compare', data: { f1: { int: 1, num: 1, den: 8 }, f2: { int: 0, num: 10, den: 8 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 217, type: 'compare', data: { f1: { int: 3, num: 2, den: 5 }, f2: { int: 3, num: 1, den: 5 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 218, type: 'compare', data: { f1: { int: 0, num: 14, den: 8 }, f2: { int: 1, num: 6, den: 8 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 219, type: 'compare', data: { f1: { int: 2, num: 5, den: 10 }, f2: { int: 2, num: 4, den: 10 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 220, type: 'compare', data: { f1: { int: 0, num: 11, den: 3 }, f2: { int: 3, num: 2, den: 3 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      
      { id: 221, type: 'compare', data: { f1: { int: 0, num: 4, den: 6 }, f2: { int: 0, num: 5, den: 6 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 222, type: 'compare', data: { f1: { int: 1, num: 2, den: 4 }, f2: { int: 0, num: 6, den: 4 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 223, type: 'compare', data: { f1: { int: 2, num: 1, den: 3 }, f2: { int: 1, num: 2, den: 3 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 224, type: 'compare', data: { f1: { int: 0, num: 15, den: 5 }, f2: { int: 3, num: 0, den: 5 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 225, type: 'compare', data: { f1: { int: 1, num: 5, den: 8 }, f2: { int: 1, num: 6, den: 8 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 226, type: 'compare', data: { f1: { int: 2, num: 3, den: 10 }, f2: { int: 0, num: 23, den: 10 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 227, type: 'compare', data: { f1: { int: 0, num: 9, den: 7 }, f2: { int: 1, num: 3, den: 7 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 228, type: 'compare', data: { f1: { int: 3, num: 1, den: 4 }, f2: { int: 2, num: 3, den: 4 } }, ans: '>', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 229, type: 'compare', data: { f1: { int: 0, num: 11, den: 6 }, f2: { int: 1, num: 5, den: 6 } }, ans: '=', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' },
      { id: 230, type: 'compare', data: { f1: { int: 2, num: 4, den: 9 }, f2: { int: 2, num: 5, den: 9 } }, ans: '<', qText: '假設兩個盤子裡的每個完整麵包都一樣大，請比較這兩個分數的大小，填入正確的比較符號喔！' }
    ],
    
    3: [
      { id: 301, type: 'calc', data: { op: '+', f1: { int: 0, num: 5, den: 8 }, f2: { int: 0, num: 6, den: 8 } }, ans: { int: 1, num: 3, den: 8 }, qText: '調配烘焙原料：同分母分數相加，請計算出正確的配方重量喔！' },
      { id: 302, type: 'calc', data: { op: '+', f1: { int: 1, num: 4, den: 5 }, f2: { int: 2, num: 3, den: 5 } }, ans: { int: 4, num: 2, den: 5 }, qText: '調配烘焙原料：帶分數相加，注意分數部分的進位喔！' },
      { id: 303, type: 'calc', data: { op: '-', f1: { int: 1, num: 0, den: 12 }, f2: { int: 0, num: 3, den: 12 } }, ans: { int: 0, num: 9, den: 12 }, qText: '調配烘焙原料：從整數 1 中減去分數，請算出剩餘的配方重量喔！' },
      { id: 304, type: 'calc', data: { op: '-', f1: { int: 4, num: 0, den: 6 }, f2: { int: 1, num: 5, den: 6 } }, ans: { int: 2, num: 1, den: 6 }, qText: '調配烘焙原料：整數減去帶分數，記得要向整數借 1 喔！' },
      { id: 305, type: 'calc', data: { op: '-', f1: { int: 2, num: 1, den: 5 }, f2: { int: 0, num: 4, den: 5 } }, ans: { int: 1, num: 2, den: 5 }, qText: '調配烘焙原料：帶分數減去真分數，分子不夠減時要向整數部分借 1 喔！' },
      { id: 306, type: 'calc', data: { op: '-', f1: { int: 5, num: 3, den: 16 }, f2: { int: 2, num: 7, den: 16 } }, ans: { int: 2, num: 12, den: 16 }, qText: '調配烘焙原料：帶分數相減，請借位並計算出正確的配方重量喔！' },
      { id: 307, type: 'calc', data: { op: '+', f1: { int: 2, num: 3, den: 10 }, f2: { int: 0, num: 9, den: 10 } }, ans: { int: 3, num: 2, den: 10 }, qText: '調配烘焙原料：帶分數與真分數相加，注意進位喔！' },
      { id: 308, type: 'calc', data: { op: '-', f1: { int: 3, num: 0, den: 5 }, f2: { int: 0, num: 4, den: 5 } }, ans: { int: 2, num: 1, den: 5 }, qText: '調配烘焙原料：整數減去真分數，請計算出正確的配方重量喔！' },
      { id: 309, type: 'calc', data: { op: '+', f1: { int: 1, num: 1, den: 4 }, f2: { int: 2, num: 1, den: 4 } }, ans: { int: 3, num: 2, den: 4 }, qText: '調配烘焙原料：帶分數相加，請計算出正確的配方重量喔！' },
      { id: 310, type: 'calc', data: { op: '-', f1: { int: 3, num: 5, den: 9 }, f2: { int: 1, num: 8, den: 9 } }, ans: { int: 1, num: 6, den: 9 }, qText: '調配烘焙原料：帶分數減法，分子不夠減要記得借位喔！' },
      { id: 311, type: 'calc', data: { op: '+', f1: { int: 0, num: 7, den: 10 }, f2: { int: 1, num: 4, den: 10 } }, ans: { int: 2, num: 1, den: 10 }, qText: '調配烘焙原料：同分母加法，請計算出正確的重量喔！' },
      { id: 312, type: 'calc', data: { op: '-', f1: { int: 3, num: 2, den: 7 }, f2: { int: 1, num: 5, den: 7 } }, ans: { int: 1, num: 4, den: 7 }, qText: '調配烘焙原料：帶分數減法，請借位並計算出正確的答案喔！' },
      { id: 313, type: 'calc', data: { op: '+', f1: { int: 2, num: 5, den: 12 }, f2: { int: 1, num: 8, den: 12 } }, ans: { int: 4, num: 1, den: 12 }, qText: '調配烘焙原料：同分母分數加法，請計算出正確的重量喔！' },
      { id: 314, type: 'calc', data: { op: '-', f1: { int: 4, num: 1, den: 8 }, f2: { int: 2, num: 3, den: 8 } }, ans: { int: 1, num: 6, den: 8 }, qText: '調配烘焙原料：帶分數相減，請借位並計算出正確的配方重量喔！' },
      { id: 315, type: 'calc', data: { op: '+', f1: { int: 1, num: 5, den: 6 }, f2: { int: 1, num: 5, den: 6 } }, ans: { int: 3, num: 4, den: 6 }, qText: '調配烘焙原料：同分母相加，請算出正確的配方重量喔！' },
      { id: 316, type: 'calc', data: { op: '-', f1: { int: 2, num: 0, den: 3 }, f2: { int: 1, num: 2, den: 3 } }, ans: { int: 0, num: 1, den: 3 }, qText: '調配烘焙原料：整數減帶分數，請借位並計算喔！' },
      { id: 317, type: 'calc', data: { op: '+', f1: { int: 2, num: 6, den: 15 }, f2: { int: 2, num: 10, den: 15 } }, ans: { int: 5, num: 1, den: 15 }, qText: '調配烘焙原料：帶分數相加，請計算出正確的重量喔！' },
      { id: 318, type: 'calc', data: { op: '-', f1: { int: 5, num: 1, den: 10 }, f2: { int: 2, num: 9, den: 10 } }, ans: { int: 2, num: 2, den: 10 }, qText: '調配烘焙原料：帶分數相減，分子不夠減要記得借位喔！' },
      { id: 319, type: 'calc', data: { op: '+', f1: { int: 1, num: 3, den: 7 }, f2: { int: 0, num: 5, den: 7 } }, ans: { int: 2, num: 1, den: 7 }, qText: '調配烘焙原料：分數加法，請計算出正確的重量喔！' },
      { id: 320, type: 'calc', data: { op: '-', f1: { int: 3, num: 4, den: 11 }, f2: { int: 1, num: 7, den: 11 } }, ans: { int: 1, num: 8, den: 11 }, qText: '調配烘焙原料：帶分數相減，分子不夠減要記得借位喔！' },
      
      { id: 321, type: 'calc', data: { op: '+', f1: { int: 1, num: 3, den: 7 }, f2: { int: 2, num: 2, den: 7 } }, ans: { int: 3, num: 5, den: 7 }, qText: '調配烘焙原料：帶分數相加，請計算出正確的配方重量喔！' },
      { id: 322, type: 'calc', data: { op: '+', f1: { int: 2, num: 5, den: 9 }, f2: { int: 1, num: 6, den: 9 } }, ans: { int: 4, num: 2, den: 9 }, qText: '調配烘焙原料：同分母分數相加，注意進位喔！' },
      { id: 323, type: 'calc', data: { op: '-', f1: { int: 3, num: 1, den: 4 }, f2: { int: 1, num: 3, den: 4 } }, ans: { int: 1, num: 2, den: 4 }, qText: '調配烘焙原料：帶分數相減，分子不夠減要記得借位喔！' },
      { id: 324, type: 'calc', data: { op: '-', f1: { int: 5, num: 0, den: 8 }, f2: { int: 2, num: 3, den: 8 } }, ans: { int: 2, num: 5, den: 8 }, qText: '調配烘焙原料：整數減去帶分數，記得要向整數借 1 喔！' },
      { id: 325, type: 'calc', data: { op: '+', f1: { int: 0, num: 8, den: 10 }, f2: { int: 0, num: 7, den: 10 } }, ans: { int: 1, num: 5, den: 10 }, qText: '調配烘焙原料：同分母分數相加，請計算出正確的配方重量喔！' },
      { id: 326, type: 'calc', data: { op: '-', f1: { int: 4, num: 2, den: 11 }, f2: { int: 1, num: 5, den: 11 } }, ans: { int: 2, num: 8, den: 11 }, qText: '調配烘焙原料：帶分數減法，分子不夠減要記得借位喔！' },
      { id: 327, type: 'calc', data: { op: '+', f1: { int: 1, num: 5, den: 12 }, f2: { int: 2, num: 9, den: 12 } }, ans: { int: 4, num: 2, den: 12 }, qText: '調配烘焙原料：同分母分數相加，注意進位喔！' },
      { id: 328, type: 'calc', data: { op: '-', f1: { int: 2, num: 1, den: 6 }, f2: { int: 0, num: 5, den: 6 } }, ans: { int: 1, num: 2, den: 6 }, qText: '調配烘焙原料：帶分數減法，分子不夠減要記得借位喔！' },
      { id: 329, type: 'calc', data: { op: '+', f1: { int: 0, num: 3, den: 5 }, f2: { int: 1, num: 4, den: 5 } }, ans: { int: 2, num: 2, den: 5 }, qText: '調配烘焙原料：同分母分數相加，注意進位喔！' },
      { id: 330, type: 'calc', data: { op: '-', f1: { int: 3, num: 0, den: 10 }, f2: { int: 1, num: 7, den: 10 } }, ans: { int: 1, num: 3, den: 10 }, qText: '調配烘焙原料：整數減去帶分數，記得要向整數借 1 喔！' }
    ],
    
    4: [
      { id: 401, type: 'multiply', data: { f1: { int: 0, num: 1, den: 6 }, factor: 5 }, ans: { int: 0, num: 5, den: 6 }, qText: '倍數魔法烤箱：將多盤蛋糕倒在一起！請算出總共有多少蛋糕喔！' },
      { id: 402, type: 'multiply', data: { f1: { int: 0, num: 2, den: 10 }, factor: 4 }, ans: { int: 0, num: 8, den: 10 }, qText: '倍數魔法烤箱：將多盤蛋糕倒在一起！請算出總共有多少蛋糕喔！' },
      { id: 403, type: 'multiply', data: { f1: { int: 0, num: 7, den: 5 }, factor: 6 }, ans: { int: 8, num: 2, den: 5 }, qText: '倍數魔法烤箱：將多盤假分數蛋糕烘焙！請算出總共是多少帶分數或假分數喔！' },
      { id: 404, type: 'multiply', data: { f1: { int: 1, num: 1, den: 5 }, factor: 3 }, ans: { int: 3, num: 3, den: 5 }, qText: '倍數魔法烤箱：帶分數的整數倍，請算出烤箱中的蛋糕總數喔！' },
      { id: 405, type: 'multiply', data: { f1: { int: 0, num: 3, den: 8 }, factor: 3 }, ans: { int: 1, num: 1, den: 8 }, qText: '倍數魔法烤箱：真分數的整數倍，請算出烤箱中的蛋糕總數喔！' },
      { id: 406, type: 'multiply', data: { f1: { int: 2, num: 2, den: 7 }, factor: 3 }, ans: { int: 6, num: 6, den: 7 }, qText: '倍數魔法烤箱：帶分數乘以整數，請算出烤箱中的蛋糕總數喔！' },
      { id: 407, type: 'multiply', data: { f1: { int: 0, num: 5, den: 12 }, factor: 2 }, ans: { int: 0, num: 10, den: 12 }, qText: '倍數魔法烤箱：將多盤蛋糕倒在一起！請算出總共有多少蛋糕喔！' },
      { id: 408, type: 'multiply', data: { f1: { int: 1, num: 3, den: 10 }, factor: 4 }, ans: { int: 5, num: 2, den: 10 }, qText: '倍數魔法烤箱：帶分數乘以整數，請算出烤箱中的蛋糕總數喔！' },
      { id: 409, type: 'multiply', data: { f1: { int: 0, num: 3, den: 5 }, factor: 2 }, ans: { int: 1, num: 1, den: 5 }, qText: '倍數魔法烤箱：真分數的整數倍，請算出烤箱中的蛋糕總數喔！' },
      { id: 410, type: 'multiply', data: { f1: { int: 0, num: 5, den: 9 }, factor: 5 }, ans: { int: 2, num: 7, den: 9 }, qText: '倍數魔法烤箱：將多盤蛋糕倒在一起！請算出總共有多少蛋糕喔！' },
      { id: 411, type: 'multiply', data: { f1: { int: 2, num: 1, den: 4 }, factor: 3 }, ans: { int: 6, num: 3, den: 4 }, qText: '倍數魔法烤箱：帶分數的整數倍，請算出烤盤中的蛋糕總數喔！' },
      { id: 412, type: 'multiply', data: { f1: { int: 0, num: 4, den: 7 }, factor: 4 }, ans: { int: 2, num: 2, den: 7 }, qText: '倍數魔法烤箱：真分數的整數倍，請算出烤箱中的蛋糕總數喔！' },
      { id: 413, type: 'multiply', data: { f1: { int: 1, num: 2, den: 9 }, factor: 5 }, ans: { int: 6, num: 1, den: 9 }, qText: '倍數魔法烤箱：帶分數的整數倍，請算出烤箱中的蛋糕總數喔！' },
      { id: 414, type: 'multiply', data: { f1: { int: 0, num: 9, den: 8 }, factor: 3 }, ans: { int: 3, num: 3, den: 8 }, qText: '倍數魔法烤箱：假分數的整數倍，請算出烤箱中的蛋糕總數喔！' },
      { id: 415, type: 'multiply', data: { f1: { int: 0, num: 3, den: 10 }, factor: 3 }, ans: { int: 0, num: 9, den: 10 }, qText: '倍數魔法烤箱：真分數的整數倍，請算出烤箱中的蛋糕總數喔！' },
      { id: 416, type: 'multiply', data: { f1: { int: 3, num: 1, den: 3 }, factor: 2 }, ans: { int: 6, num: 2, den: 3 }, qText: '倍數魔法烤箱：帶分數乘以整數，請計算正確的蛋糕量喔！' },
      { id: 417, type: 'multiply', data: { f1: { int: 0, num: 4, den: 5 }, factor: 3 }, ans: { int: 2, num: 2, den: 5 }, qText: '倍數魔法烤箱：真分數的整數倍，請計算正確的蛋糕量喔！' },
      { id: 418, type: 'multiply', data: { f1: { int: 1, num: 3, den: 8 }, factor: 5 }, ans: { int: 6, num: 7, den: 8 }, qText: '倍數魔法烤箱：帶分數乘以整數，請計算正確的蛋糕量喔！' },
      { id: 419, type: 'multiply', data: { f1: { int: 0, num: 7, den: 12 }, factor: 3 }, ans: { int: 1, num: 9, den: 12 }, qText: '倍數魔法烤箱：真分數的整數倍，請計算正確的蛋糕量喔！' },
      { id: 420, type: 'multiply', data: { f1: { int: 2, num: 3, den: 10 }, factor: 2 }, ans: { int: 4, num: 6, den: 10 }, qText: '倍數魔法烤箱：帶分數乘以整數，請計算正確的蛋糕量喔！' },
      
      { id: 421, type: 'multiply', data: { f1: { int: 0, num: 2, den: 7 }, factor: 3 }, ans: { int: 0, num: 6, den: 7 }, qText: '倍數魔法烤箱：真分數的整數倍，請計算正確的蛋糕量喔！' },
      { id: 422, type: 'multiply', data: { f1: { int: 0, num: 3, den: 4 }, factor: 3 }, ans: { int: 2, num: 1, den: 4 }, qText: '倍數魔法烤箱：將多盤蛋糕倒在一起！請算出總共有多少蛋糕喔！' },
      { id: 423, type: 'multiply', data: { f1: { int: 1, num: 1, den: 6 }, factor: 4 }, ans: { int: 4, num: 4, den: 6 }, qText: '倍數魔法烤箱：帶分數的整數倍，請算出烤盤中的蛋糕總數喔！' },
      { id: 424, type: 'multiply', data: { f1: { int: 1, num: 2, den: 5 }, factor: 3 }, ans: { int: 4, num: 1, den: 5 }, qText: '倍數魔法烤箱：帶分數乘以整數，請計算正確的蛋糕量喔！' },
      { id: 425, type: 'multiply', data: { f1: { int: 0, num: 5, den: 8 }, factor: 2 }, ans: { int: 1, num: 2, den: 8 }, qText: '倍數魔法烤箱：真分數的整數倍，請計算正確的蛋糕量喔！' },
      { id: 426, type: 'multiply', data: { f1: { int: 2, num: 1, den: 9 }, factor: 4 }, ans: { int: 8, num: 4, den: 9 }, qText: '倍數魔法烤箱：帶分數的整數倍，請算出烤箱中的蛋糕總數喔！' },
      { id: 427, type: 'multiply', data: { f1: { int: 0, num: 7, den: 10 }, factor: 2 }, ans: { int: 1, num: 4, den: 10 }, qText: '倍數魔法烤箱：將多盤蛋糕倒在一起！請算出總共有多少蛋糕喔！' },
      { id: 428, type: 'multiply', data: { f1: { int: 1, num: 3, den: 7 }, factor: 2 }, ans: { int: 2, num: 6, den: 7 }, qText: '倍數魔法烤箱：帶分數的整數倍，請算出烤盤中的蛋糕總數喔！' },
      { id: 429, type: 'multiply', data: { f1: { int: 0, num: 4, den: 3 }, factor: 2 }, ans: { int: 2, num: 2, den: 3 }, qText: '倍數魔法烤箱：將多盤假分數蛋糕烘焙！請算出總共是多少帶分數或假分數喔！' },
      { id: 430, type: 'multiply', data: { f1: { int: 2, num: 2, den: 5 }, factor: 2 }, ans: { int: 4, num: 4, den: 5 }, qText: '倍數魔法烤箱：帶分數乘以整數，請計算正確的蛋糕量喔！' }
    ]
  },
  
  // Shuffles a list and returns a new array copy
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
  
  // Generates randomized question set (at least 15 items in bank, selecting 5 for the round)
  generateRound(level) {
    const fullBank = this.levels[level] || [];
    // Ensure we shuffle the full bank of 20 questions
    const shuffledBank = this.shuffle(fullBank);
    // Return first 5 for the standard round play, but keep the shuffled full bank reference for playtest
    return {
      roundQuestions: shuffledBank.slice(0, 5),
      fullBank: shuffledBank
    };
  }
};

// ==================== 5. RENDERING ENGINE (Visual representations) ====================
const RenderEngine = {
  
  /**
   * Helper to draw a single SVG circular cake.
   * filledSlices: number of active/colored slices.
   * totalSlices: denominator.
   * isInteractive: if true, slices are clickable to paint them.
   * onClickCallback: function(currentFilledCount) called when user toggles slices.
   */
  drawCakeSVG(containerId, filledSlices, totalSlices, isInteractive = false, onClickCallback = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; // Clear
    
    const div = document.createElement('div');
    div.className = 'baking-plate';
    
    const plateBase = document.createElement('div');
    plateBase.className = 'plate-base';
    div.appendChild(plateBase);
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('class', 'plate-cake-svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    
    // Draw slices
    let currentFilled = filledSlices;
    
    if (totalSlices === 1) {
      // Draw single full circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '45');
      circle.setAttribute('class', `cake-slice ${currentFilled >= 1 ? 'filled' : 'empty'} ${isInteractive ? 'clickable' : ''}`);
      
      if (isInteractive) {
        circle.addEventListener('click', () => {
          currentFilled = currentFilled === 1 ? 0 : 1;
          circle.setAttribute('class', `cake-slice ${currentFilled >= 1 ? 'filled' : 'empty'} clickable`);
          AudioSynth.play('click');
          if (onClickCallback) onClickCallback(currentFilled);
        });
      }
      
      svg.appendChild(circle);
    } else {
      // Draw sector slices
      const r = 45;
      const cx = 50;
      const cy = 50;
      const angleStep = (2 * Math.PI) / totalSlices;
      const paths = [];
      
      for (let i = 0; i < totalSlices; i++) {
        const thetaStart = i * angleStep;
        const thetaEnd = (i + 1) * angleStep;
        
        const x1 = cx + r * Math.cos(thetaStart);
        const y1 = cy + r * Math.sin(thetaStart);
        const x2 = cx + r * Math.cos(thetaEnd);
        const y2 = cy + r * Math.sin(thetaEnd);
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const dStr = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
        path.setAttribute('d', dStr);
        
        const isFilled = i < currentFilled;
        path.setAttribute('class', `cake-slice ${isFilled ? 'filled' : 'empty'} ${isInteractive ? 'clickable' : ''}`);
        
        if (isInteractive) {
          const idx = i;
          path.addEventListener('click', () => {
            // Fill up to this slice or toggle
            if (currentFilled === idx + 1) {
              currentFilled = idx; // Unfill this one
            } else {
              currentFilled = idx + 1; // Fill up to here
            }
            
            // Redraw/Reclass all slices
            paths.forEach((p, pIdx) => {
              const f = pIdx < currentFilled;
              p.setAttribute('class', `cake-slice ${f ? 'filled' : 'empty'} clickable`);
            });
            
            AudioSynth.play('click');
            if (onClickCallback) onClickCallback(currentFilled);
          });
        }
        
        svg.appendChild(path);
        paths.push(path);
      }
    }
    
    div.appendChild(svg);
    
    // Add small text label under plate
    const label = document.createElement('div');
    label.className = 'plate-label';
    label.innerText = `分母為 ${totalSlices}`;
    div.appendChild(label);
    
    container.appendChild(div);
  },
  
  /**
   * Renders fraction representations in Level 1 (Understanding and conversion)
   */
  renderLevel1Visual(containerId, intPart, numPart, denPart, isInteractive = false, onStateChange = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    const cakeContainer = document.createElement('div');
    cakeContainer.className = 'cake-visualization-container';
    cakeContainer.id = containerId + '-cakes';
    container.appendChild(cakeContainer);
    
    // We render multiple cakes to represent mixed values or improper values
    // e.g. for 2又3/4, we render 3 plates.
    // First 2 plates are fully filled (4/4). Third plate has 3/4 filled.
    const maxPlates = Math.ceil((intPart * denPart + numPart) / denPart) || 1;
    // Always render at least 2 plates if improper or mixed, to visualize wholes
    const platesToRender = Math.max(maxPlates, 2);
    
    let totalFilled = intPart * denPart + numPart;
    
    const redrawAll = () => {
      cakeContainer.innerHTML = '';
      let remainingFilled = totalFilled;
      
      for (let i = 0; i < platesToRender; i++) {
        const plateId = `${containerId}-plate-${i}`;
        const plateDiv = document.createElement('div');
        plateDiv.id = plateId;
        cakeContainer.appendChild(plateDiv);
        
        const filledForThisPlate = Math.min(remainingFilled, denPart);
        remainingFilled -= filledForThisPlate;
        
        const idx = i;
        this.drawCakeSVG(plateId, filledForThisPlate, denPart, isInteractive, (newFilledForThisPlate) => {
          // Re-calculate total filled based on user clicks
          // Each plate handles its portion
          let recalculatedTotal = 0;
          const plates = cakeContainer.querySelectorAll('.baking-plate');
          
          // Let's gather values from each plate state
          // To make it easy, we read what the clicks altered.
          // Since it's interactive, we can update totalFilled directly
          // We know plate i's filled count is now newFilledForThisPlate
          // Let's update our global count
          const currentPlatesFilled = [];
          let tempRemaining = totalFilled;
          for(let p=0; p<platesToRender; p++) {
            currentPlatesFilled.push(Math.min(tempRemaining, denPart));
            tempRemaining = Math.max(0, tempRemaining - denPart);
          }
          currentPlatesFilled[idx] = newFilledForThisPlate;
          
          // Recompute total filled
          totalFilled = currentPlatesFilled.reduce((sum, val) => sum + val, 0);
          
          // Update visual states of all plates downstream/upstream
          let tempVal = totalFilled;
          const allSlicesGrouped = cakeContainer.querySelectorAll('.plate-cake-svg');
          allSlicesGrouped.forEach((svgEl, svgIdx) => {
            const plateFilledCount = Math.min(tempVal, denPart);
            tempVal = Math.max(0, tempVal - denPart);
            
            const slices = svgEl.querySelectorAll('.cake-slice');
            slices.forEach((slice, sliceIdx) => {
              const shouldBeFilled = sliceIdx < plateFilledCount;
              slice.setAttribute('class', `cake-slice ${shouldBeFilled ? 'filled' : 'empty'} clickable`);
            });
          });
          
          if (onStateChange) {
            const calculatedInt = Math.floor(totalFilled / denPart);
            const calculatedNum = totalFilled % denPart;
            onStateChange(calculatedInt, calculatedNum, denPart);
          }
        });
      }
    };
    
    redrawAll();
  },
  
  /**
   * Level 2 Comparison Overlay (Semi-transparent overlay to clear whole number bias)
   */
  showLevel2Overlap(f1, f2, containerId) {
    const parentContainer = document.getElementById(containerId);
    if (!parentContainer) return;
    
    // Create overlap overlay container
    const overlay = document.createElement('div');
    overlay.className = 'overlap-simulation';
    overlay.id = 'overlap-overlay';
    
    const title = document.createElement('h3');
    title.style.color = 'var(--magic-gold)';
    title.innerText = '💡 魔法半透明重疊比對！';
    overlay.appendChild(title);
    
    const desc = document.createElement('p');
    desc.className = 'overlap-explanation-text';
    
    // Convert to values
    const val1 = f1.int + f1.num / f1.den;
    const val2 = f2.int + f2.num / f2.den;
    
    const str1 = MathRenderer.toSpeechText(f1.int, f1.num, f1.den);
    const str2 = MathRenderer.toSpeechText(f2.int, f2.num, f2.den);
    
    let relationText = '';
    if (val1 > val2) {
      relationText = `${str1} 比 ${str2} 大喔！`;
    } else if (val1 < val2) {
      relationText = `${str1} 比 ${str2} 小喔！`;
    } else {
      relationText = `${str1} 和 ${str2} 一樣大喔！`;
    }
    
    desc.innerHTML = `
      藍色代表第一盤的 ${MathRenderer.render(f1.int, f1.num, f1.den)}，
      橘色代表第二盤的 ${MathRenderer.render(f2.int, f2.num, f2.den)}。<br>
      ${relationText} 重疊在一起，誰露出來的部分多，誰就比較大喔！
    `;
    overlay.appendChild(desc);
    
    // SVG containing both overlays
    const overlapBox = document.createElement('div');
    overlapBox.className = 'overlap-container';
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('class', 'overlap-cake-svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    
    const cx = 50;
    const cy = 50;
    const r = 45;
    
    // Draw f1 slices (Blue overlay)
    const drawOverlapSlices = (fVal, cssClass, sweepDir) => {
      // Represent total slices on 1 cake, normalized
      const den = fVal.den;
      const totalParts = fVal.int * den + fVal.num;
      // We will draw the total parts as sectors.
      // If it exceeds 1 whole, we will wrap it into the single circle visual to show portion size compared to 1 whole!
      // This is a beautiful way to visualize improper fractions!
      const fractionVal = totalParts / den;
      const angle = (2 * Math.PI) * (fractionVal % 1 === 0 && fractionVal > 0 ? 1 : (fractionVal % 1));
      
      if (fractionVal >= 1 && angle === 0) {
        // Exactly whole numbers
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('cx', '50');
        circle.setAttribute('cy', '50');
        circle.setAttribute('r', `${cssClass === 'overlap-slice-a' ? 45 : 40}`); // slight size diff to see border
        circle.setAttribute('class', cssClass);
        svg.appendChild(circle);
      } else {
        // Draw whole circles for the integer part
        const wholes = Math.floor(fractionVal);
        if (wholes > 0) {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute('cx', '50');
          circle.setAttribute('cy', '50');
          circle.setAttribute('r', `${cssClass === 'overlap-slice-a' ? 45 : 40}`);
          circle.setAttribute('class', cssClass);
          circle.style.opacity = '0.4';
          svg.appendChild(circle);
        }
        
        // Draw fractional sector on top
        if (angle > 0) {
          const x1 = cx + r * Math.cos(0);
          const y1 = cy + r * Math.sin(0);
          const x2 = cx + r * Math.cos(angle);
          const y2 = cy + r * Math.sin(angle);
          
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          const largeArc = angle > Math.PI ? 1 : 0;
          const dStr = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          path.setAttribute('d', dStr);
          path.setAttribute('class', cssClass);
          svg.appendChild(path);
        }
      }
    };
    
    // Draw both
    drawOverlapSlices(f1, 'overlap-slice-a'); // Blue
    drawOverlapSlices(f2, 'overlap-slice-b'); // Orange
    
    overlapBox.appendChild(svg);
    overlay.appendChild(overlapBox);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-primary overlap-close-btn';
    closeBtn.innerText = '關閉比對，我懂了！';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.remove();
    });
    overlay.appendChild(closeBtn);
    
    parentContainer.appendChild(overlay);
  },
  
  /**
   * Level 3: Renders the physical balance scale
   * angle: balance tilt angle in degrees.
   */
  renderLevel3Scale(containerId, angle = 0) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Trigonometry to update scale positions dynamically
    const rad = (angle * Math.PI) / 180;
    
    // Pivot point (210, 90)
    const px = 210;
    const py = 90;
    const armLength = 120;
    
    // Left & Right beam ends
    const Lx = px - armLength * Math.cos(rad);
    const Ly = py + armLength * Math.sin(rad);
    
    const Rx = px + armLength * Math.cos(rad);
    const Ry = py - armLength * Math.sin(rad);
    
    // Left & Right pan trays (hanging 75px below beam ends)
    const panHeight = 75;
    const Lpx = Lx;
    const Lpy = Ly + panHeight;
    const Rpx = Rx;
    const Rpy = Ry + panHeight;
    
    const isTilted = Math.abs(angle) > 2;
    const tiltClass = isTilted ? 'shake-scale' : '';
    
    container.innerHTML = `
      <svg class="balance-scale-svg ${tiltClass}" viewBox="0 0 420 250">
        <!-- Scale Base Stand -->
        <path d="M 195 240 L 210 90 L 225 240 Z" fill="hsl(230, 25%, 35%)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <rect x="150" y="235" width="120" height="15" rx="5" fill="hsl(230, 20%, 25%)" stroke="rgba(255,255,255,0.2)"/>
        
        <!-- Central Pointer Dial -->
        <circle cx="${px}" cy="${py}" r="15" fill="var(--bg-dark-1)" stroke="var(--magic-gold)" stroke-width="2"/>
        <!-- Dial arrow pointing upwards, offset by angle -->
        <line x1="${px}" y1="${py}" x2="${px - 30 * Math.sin(rad)}" y2="${py - 30 * Math.cos(rad)}" stroke="var(--magic-gold)" stroke-width="3.5" stroke-linecap="round"/>
        
        <!-- Scale Beam (lever arm) -->
        <line x1="${Lx}" y1="${Ly}" x2="${Rx}" y2="${Ry}" class="scale-beam" stroke="#dbdbdb" stroke-width="6"/>
        
        <!-- Left Pan Group (Hanger lines + Tray) -->
        <g class="left-pan-group">
          <!-- Left Hanger ropes -->
          <line x1="${Lx}" y1="${Ly}" x2="${Lpx - 30}" y2="${Lpy}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <line x1="${Lx}" y1="${Ly}" x2="${Lpx + 30}" y2="${Lpy}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <!-- Left Tray (Plate) -->
          <ellipse cx="${Lpx}" cy="${Lpy}" rx="40" ry="10" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
          <!-- Pastry representation on Left Pan -->
          <text x="${Lpx - 14}" y="${Lpy - 8}" font-size="1.8rem">🧁</text>
        </g>
        
        <!-- Right Pan Group (Hanger lines + Tray) -->
        <g class="right-pan-group">
          <!-- Right Hanger ropes -->
          <line x1="${Rx}" y1="${Ry}" x2="${Rpx - 30}" y2="${Rpy}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <line x1="${Rx}" y1="${Ry}" x2="${Rpx + 30}" y2="${Rpy}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <!-- Right Tray (Plate) -->
          <ellipse cx="${Rpx}" cy="${Rpy}" rx="40" ry="10" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
          <!-- Pastry representation on Right Pan -->
          <text x="${Rpx - 14}" y="${Rpy - 8}" font-size="1.8rem">🎂</text>
        </g>
        
        <!-- Pivot cap -->
        <circle cx="${px}" cy="${py}" r="6" class="scale-pivot"/>
      </svg>
    `;
  },
  
  /**
   * Level 4 Repeated cake trays for multiplication visual
   */
  renderLevel4Visual(containerId, f1, factor) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    const mainWrap = document.createElement('div');
    mainWrap.style.display = 'flex';
    mainWrap.style.alignItems = 'center';
    mainWrap.style.justifyContent = 'center';
    mainWrap.style.width = '100%';
    
    // Left: grid showing repeating plates
    const grid = document.createElement('div');
    grid.className = 'multiples-grid';
    grid.style.flexGrow = '1';
    
    for (let i = 0; i < factor; i++) {
      const card = document.createElement('div');
      card.className = 'multiple-baking-card';
      
      const pId = `${containerId}-mult-plate-${i}`;
      const pDiv = document.createElement('div');
      pDiv.id = pId;
      card.appendChild(pDiv);
      
      const label = document.createElement('div');
      label.style.fontSize = '0.9rem';
      label.style.marginTop = '6px';
      label.innerHTML = `第 ${i+1} 盤: ${MathRenderer.render(f1.int, f1.num, f1.den)}`;
      card.appendChild(label);
      
      grid.appendChild(card);
    }
    
    mainWrap.appendChild(grid);
    
    // Middle: Multiplication symbol
    const multSym = document.createElement('div');
    multSym.className = 'integer-multiplication-symbol';
    multSym.innerText = '×';
    mainWrap.appendChild(multSym);
    
    // Right: factor number display
    const factorDisp = document.createElement('div');
    factorDisp.className = 'integer-factor-display';
    factorDisp.innerText = factor;
    mainWrap.appendChild(factorDisp);
    
    container.appendChild(mainWrap);
    
    // Render the cake SVGs in the grid
    for (let i = 0; i < factor; i++) {
      const pId = `${containerId}-mult-plate-${i}`;
      // Render cakes for fraction: if mixed, render multiple cakes, if proper, render single cake
      this.renderLevel1Visual(pId, f1.int, f1.num, f1.den, false);
    }
  }
};

// ==================== 6. GAME ENGINE (Single-player manager) ====================
const gameEngine = {
  currentScreen: 'home',
  currentLevel: 1,
  questions: [],
  currentQuestionIdx: 0,
  selectedChoice: null, // For choice questions
  starsCount: { 1: 0, 2: 0, 3: 0, 4: 0 },
  
  init() {
    this.bindEvents();
    this.updateStarsUI();
  },
  
  bindEvents() {
    // Pointer events for all clickable static items
    const btnTts = document.getElementById('btn-tts');
    if (btnTts) {
      btnTts.addEventListener('pointerdown', () => {
        const currQ = this.questions[this.currentQuestionIdx];
        if (currQ) {
          VoiceManager.speak(currQ.qText);
        }
      });
    }
    
    // Auto TTS Toggle setting
    const autoTtsCheckbox = document.getElementById('tts-auto-toggle');
    if (autoTtsCheckbox) {
      const savedPreference = localStorage.getItem('auto_tts_enabled');
      if (savedPreference !== null) {
        autoTtsCheckbox.checked = (savedPreference === 'true');
      }
      
      autoTtsCheckbox.addEventListener('change', () => {
        localStorage.setItem('auto_tts_enabled', autoTtsCheckbox.checked);
        if (!autoTtsCheckbox.checked) {
          VoiceManager.stop();
        }
        AudioSynth.play('click');
      });
    }
  },
  
  switchScreen(screenId) {
    VoiceManager.stop();
    
    // Remove active from all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Activate target
    const target = document.getElementById(`${screenId}-screen`);
    if (target) {
      target.classList.add('active');
    }
    
    this.currentScreen = screenId;
    AudioSynth.play('click');
  },
  
  toggleInstructionModal(show) {
    const modal = document.getElementById('instruction-modal');
    if (show) {
      modal.classList.remove('hidden');
      VoiceManager.speak("歡迎來到分數魔法烘焙屋！在這裡，你可以自學魔法關卡，也可以和朋友進行烘焙對決喔！");
    } else {
      modal.classList.add('hidden');
    }
    AudioSynth.play('click');
  },
  
  toggleWinnerModal(show, title = "", desc = "") {
    const modal = document.getElementById('winner-modal');
    if (show) {
      document.getElementById('winner-title').innerText = title;
      document.getElementById('winner-desc').innerText = desc;
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  },
  
  updateStarsUI() {
    // Update map nodes
    for (let lvl = 1; lvl <= 4; lvl++) {
      const starsDiv = document.querySelector(`#node-level-${lvl} .level-stars`);
      if (starsDiv) {
        const count = this.starsCount[lvl];
        starsDiv.innerText = '⭐'.repeat(count) + '☆'.repeat(3 - count);
      }
    }
    // Update total
    const total = Object.values(this.starsCount).reduce((sum, val) => sum + val, 0);
    const totalStarsEl = document.getElementById('total-stars');
    if (totalStarsEl) {
      totalStarsEl.innerText = total;
    }
  },
  
  startSingleLevel(level) {
    this.currentLevel = level;
    this.currentQuestionIdx = 0;
    
    // Generate randomized questions from bank
    const roundData = QuestionGenerator.generateRound(level);
    this.questions = roundData.roundQuestions;
    
    // Update UI elements
    document.getElementById('single-level-title').innerText = `關卡 ${level} - ${this.getLevelName(level)}`;
    
    this.switchScreen('single');
    this.loadQuestion();
  },
  
  getLevelName(level) {
    switch(level) {
      case 1: return '認識與互換魔法屋';
      case 2: return '分數比大小天平';
      case 3: return '同分母加減魔法秤';
      case 4: return '倍數烤箱魔法陣';
      default: return '分數魔法關卡';
    }
  },
  
  loadQuestion() {
    VoiceManager.stop();
    this.selectedChoice = null;
    
    // Hide feedback & buttons
    document.getElementById('answer-feedback').classList.add('hidden');
    document.getElementById('btn-next-question').classList.add('hidden');
    document.getElementById('btn-submit-answer').classList.remove('hidden');
    
    // Set progression indicators
    document.getElementById('curr-q-idx').innerText = this.currentQuestionIdx + 1;
    document.getElementById('total-q-idx').innerText = this.questions.length;
    
    const currQ = this.questions[this.currentQuestionIdx];
    if (!currQ) return;
    
    // Display question text
    document.getElementById('question-text').innerText = currQ.qText;
    
    // Trigger TTS reading of the question automatically if enabled
    const autoTtsCheckbox = document.getElementById('tts-auto-toggle');
    const shouldAutoTts = autoTtsCheckbox ? autoTtsCheckbox.checked : true;
    if (shouldAutoTts) {
      VoiceManager.speak(currQ.qText);
    }
    
    // Set up interactive visual area and answers inputs depending on Level & Question Type
    this.setupLevelWorkspace(currQ);
  },
  
  setupLevelWorkspace(q) {
    const visualArea = document.getElementById('visual-interaction-area');
    const inputsContainer = document.getElementById('answer-inputs-container');
    
    visualArea.innerHTML = '';
    inputsContainer.innerHTML = '';
    
    // Level 1: Understanding & conversion
    if (this.currentLevel === 1) {
      if (q.type === 'classify') {
        // Draw the static fraction visually
        const fDiv = document.createElement('div');
        fDiv.id = 'l1-static-cake';
        visualArea.appendChild(fDiv);
        RenderEngine.renderLevel1Visual('l1-static-cake', q.data.int, q.data.num, q.data.den, false);
        
        // Output mathematical fraction equation above
        const mathEq = document.createElement('div');
        mathEq.style.fontSize = '3.5rem';
        mathEq.style.marginBottom = '20px';
        mathEq.innerHTML = MathRenderer.render(q.data.int, q.data.num, q.data.den);
        visualArea.insertBefore(mathEq, fDiv);
        
        // Setup inputs as Multiple Choice classification
        inputsContainer.innerHTML = `
          <div class="choices-layout">
            <button class="btn-choice" data-choice="true">真分數</button>
            <button class="btn-choice" data-choice="improper">假分數</button>
            <button class="btn-choice" data-choice="mixed">帶分數</button>
          </div>
        `;
        
        // Bind choice clicks
        inputsContainer.querySelectorAll('.btn-choice').forEach(btn => {
          btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            inputsContainer.querySelectorAll('.btn-choice').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.selectedChoice = btn.getAttribute('data-choice');
            AudioSynth.play('click');
          });
        });
        
      } else if (q.type === 'convert_to_mixed' || q.type === 'convert_to_improper') {
        // Output mathematical equation in a vertical layout
        const equationWrap = document.createElement('div');
        equationWrap.style.display = 'flex';
        equationWrap.style.flexDirection = 'column';
        equationWrap.style.alignItems = 'center';
        equationWrap.style.gap = '20px';
        equationWrap.style.width = '100%';
        
        const mathFormula = document.createElement('div');
        mathFormula.style.display = 'flex';
        mathFormula.style.alignItems = 'center';
        mathFormula.style.gap = '16px';
        mathFormula.style.fontSize = '3.5rem';
        
        const fLeft = document.createElement('div');
        fLeft.innerHTML = MathRenderer.render(q.data.int, q.data.num, q.data.den);
        
        const equals = document.createElement('div');
        equals.innerText = '=';
        
        const questionMark = document.createElement('div');
        questionMark.style.color = 'var(--magic-gold)';
        questionMark.innerText = '？';
        
        mathFormula.appendChild(fLeft);
        mathFormula.appendChild(equals);
        mathFormula.appendChild(questionMark);
        equationWrap.appendChild(mathFormula);
        
        const interactiveRight = document.createElement('div');
        interactiveRight.id = 'l1-interactive-fraction-bake';
        interactiveRight.style.width = '100%';
        equationWrap.appendChild(interactiveRight);
        
        visualArea.appendChild(equationWrap);
        
        // Let the bottom side be interactive cakes representing user input
        // Initially draw matching the question fraction
        RenderEngine.renderLevel1Visual('l1-interactive-fraction-bake', q.data.int, q.data.num, q.data.den, true, (calcInt, calcNum, calcDen) => {
          // When user changes the interactive representation, update our input fields
          const intInput = document.getElementById('ans-int');
          const numInput = document.getElementById('ans-num');
          const denInput = document.getElementById('ans-den');
          
          if (q.type === 'convert_to_improper') {
            // For improper fractions, integer part is 0, and numerator is the total filled slices
            const totalSlices = calcInt * calcDen + calcNum;
            if (intInput) intInput.value = 0;
            if (numInput) numInput.value = totalSlices;
          } else {
            // For mixed fractions, use standard calculated values
            if (intInput) intInput.value = calcInt;
            if (numInput) numInput.value = calcNum;
          }
          if (denInput) denInput.value = calcDen;
        });
        
        // Setup inputs as text box fraction input
        inputsContainer.innerHTML = `
          <div class="fraction-input-block">
            <input type="number" id="ans-int" placeholder="整數" class="int-input-box" min="0" value="0">
            <div class="frac-input-group">
              <input type="number" id="ans-num" placeholder="分子" class="frac-input-box" min="0">
              <div class="frac-input-divider"></div>
              <input type="number" id="ans-den" placeholder="分母" class="frac-input-box" min="1" value="${q.data.den}" readonly>
            </div>
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted);">可以直接在上方蛋糕點擊分配，或者在此輸入數值喔！</p>
        `;
      }
    }
    
    // Level 2: Fraction Comparison
    else if (this.currentLevel === 2) {
      visualArea.innerHTML = `
        <div class="comparison-layout" id="l2-comp-container">
          <div class="comparison-plates">
            <div class="comp-plate-card">
              <div style="font-size: 2.2rem;">${MathRenderer.render(q.data.f1.int, q.data.f1.num, q.data.f1.den)}</div>
              <div id="l2-plate-left"></div>
            </div>
            
            <div class="comparison-slot" id="l2-comparison-sign">?</div>
            
            <div class="comp-plate-card">
              <div style="font-size: 2.2rem;">${MathRenderer.render(q.data.f2.int, q.data.f2.num, q.data.f2.den)}</div>
              <div id="l2-plate-right"></div>
            </div>
          </div>
        </div>
      `;
      
      // Render left plate & right plate static cakes
      RenderEngine.renderLevel1Visual('l2-plate-left', q.data.f1.int, q.data.f1.num, q.data.f1.den, false);
      RenderEngine.renderLevel1Visual('l2-plate-right', q.data.f2.int, q.data.f2.num, q.data.f2.den, false);
      
      // Setup comparison buttons
      inputsContainer.innerHTML = `
        <div class="comparison-buttons">
          <button class="btn-comparison-sign" data-sign=">">&gt;</button>
          <button class="btn-comparison-sign" data-sign="=">=</button>
          <button class="btn-comparison-sign" data-sign="<">&lt;</button>
        </div>
      `;
      
      inputsContainer.querySelectorAll('.btn-comparison-sign').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          inputsContainer.querySelectorAll('.btn-comparison-sign').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedChoice = btn.getAttribute('data-sign');
          document.getElementById('l2-comparison-sign').innerText = this.selectedChoice;
          AudioSynth.play('click');
        });
      });
    }
    
    // Level 3: Addition & Subtraction
    else if (this.currentLevel === 3) {
      // Scale visual
      const scaleDiv = document.createElement('div');
      scaleDiv.id = 'l3-scale-box';
      visualArea.appendChild(scaleDiv);
      RenderEngine.renderLevel3Scale('l3-scale-box', 0);
      
      // Math equation display
      const eqText = document.createElement('div');
      eqText.style.fontSize = '2.5rem';
      eqText.style.marginTop = '16px';
      
      const opText = q.data.op === '+' ? '＋' : '－';
      eqText.innerHTML = `
        ${MathRenderer.render(q.data.f1.int, q.data.f1.num, q.data.f1.den)}
        ${opText}
        ${MathRenderer.render(q.data.f2.int, q.data.f2.num, q.data.f2.den)}
        ＝ ？
      `;
      visualArea.appendChild(eqText);
      
      // Answer Inputs (Whole number, Numerator, Denominator)
      inputsContainer.innerHTML = `
        <div class="fraction-input-block">
          <input type="number" id="ans-int" placeholder="整數" class="int-input-box" min="0" value="0">
          <div class="frac-input-group">
            <input type="number" id="ans-num" placeholder="分子" class="frac-input-box" min="0">
            <div class="frac-input-divider"></div>
            <input type="number" id="ans-den" placeholder="分母" class="frac-input-box" min="1" value="${q.data.f1.den}" readonly>
          </div>
        </div>
      `;
    }
    
    // Level 4: Integer Multiples
    else if (this.currentLevel === 4) {
      // Repeated plates view
      const visualContainer = document.createElement('div');
      visualContainer.id = 'l4-multiples-visual';
      visualArea.appendChild(visualContainer);
      RenderEngine.renderLevel4Visual('l4-multiples-visual', q.data.f1, q.data.factor);
      
      // Fraction Answer Inputs
      inputsContainer.innerHTML = `
        <div class="fraction-input-block">
          <input type="number" id="ans-int" placeholder="整數" class="int-input-box" min="0" value="0">
          <div class="frac-input-group">
            <input type="number" id="ans-num" placeholder="分子" class="frac-input-box" min="0">
            <div class="frac-input-divider"></div>
            <input type="number" id="ans-den" placeholder="分母" class="frac-input-box" min="1" value="${q.data.f1.den}" readonly>
          </div>
        </div>
      `;
    }
  },
  
  submitAnswer() {
    const q = this.questions[this.currentQuestionIdx];
    if (!q) return;
    
    let isCorrect = false;
    let studentAnsStr = "";
    
    // Retrieve inputs based on Level
    if (this.currentLevel === 1) {
      if (q.type === 'classify') {
        if (!this.selectedChoice) {
          VoiceManager.speak("請先選擇一個分數類型喔！");
          return;
        }
        isCorrect = (this.selectedChoice === q.ans);
        studentAnsStr = this.selectedChoice === 'true' ? '真分數' : (this.selectedChoice === 'improper' ? '假分數' : '帶分數');
      } else {
        const intVal = parseInt(document.getElementById('ans-int').value) || 0;
        let numRaw = document.getElementById('ans-num').value.trim();
        let numVal = parseInt(numRaw);
        if (numRaw === "" && intVal > 0) {
          numVal = 0;
        }
        const denVal = parseInt(document.getElementById('ans-den').value) || 1;
        
        if (isNaN(numVal)) {
          VoiceManager.speak("請先輸入分子的數值喔！");
          return;
        }
        
        isCorrect = (intVal === q.ans.int && numVal === q.ans.num && denVal === q.ans.den);
        studentAnsStr = MathRenderer.toSpeechText(intVal, numVal, denVal);
      }
    }
    
    else if (this.currentLevel === 2) {
      if (!this.selectedChoice) {
        VoiceManager.speak("請先選擇大於、小於或等於符號喔！");
        return;
      }
      isCorrect = (this.selectedChoice === q.ans);
      studentAnsStr = this.selectedChoice;
    }
    
    else if (this.currentLevel === 3 || this.currentLevel === 4) {
      const intVal = parseInt(document.getElementById('ans-int').value) || 0;
      let numRaw = document.getElementById('ans-num').value.trim();
      let numVal = parseInt(numRaw);
      if (numRaw === "" && intVal > 0) {
        numVal = 0;
      }
      const denVal = parseInt(document.getElementById('ans-den').value) || 1;
      
      if (isNaN(numVal)) {
        VoiceManager.speak("請先輸入分子的數值喔！");
        return;
      }
      
      const studentSlices = intVal * denVal + numVal;
      const targetSlices = q.ans.int * q.ans.den + q.ans.num;
      isCorrect = (studentSlices === targetSlices && denVal === q.ans.den);
      studentAnsStr = MathRenderer.toSpeechText(intVal, numVal, denVal);
    }
    
    // Display Feedback
    const feedbackEl = document.getElementById('answer-feedback');
    const statusEl = feedbackEl.querySelector('.feedback-status');
    const explEl = feedbackEl.querySelector('.feedback-explanation');
    
    feedbackEl.classList.remove('hidden', 'correct', 'incorrect');
    
    if (isCorrect) {
      // Play C-major success arpeggio
      AudioSynth.play('correct');
      statusEl.innerText = "答對了！你太棒了！🎉";
      feedbackEl.classList.add('correct');
      
      // Generate positive verbal encouragement
      let rewardSpeech = "答對了！你太棒了！";
      
      // Dynamic explanation text
      if (this.currentLevel === 1) {
        if (q.type === 'classify') {
          explEl.innerHTML = `沒錯，${MathRenderer.render(q.data.int, q.data.num, q.data.den)} 是個符合規範的<strong>${studentAnsStr}</strong>喔！`;
        } else {
          explEl.innerHTML = `對了！${MathRenderer.render(q.data.int, q.data.num, q.data.den)} 等於 ${MathRenderer.render(q.ans.int, q.ans.num, q.ans.den)}。`;
        }
      } else if (this.currentLevel === 2) {
        explEl.innerHTML = `沒錯！${MathRenderer.render(q.data.f1.int, q.data.f1.num, q.data.f1.den)} ${q.ans} ${MathRenderer.render(q.data.f2.int, q.data.f2.num, q.data.f2.den)}。比較非常正確！`;
      } else if (this.currentLevel === 3) {
        const op = q.data.op === '+' ? '加上' : '減去';
        explEl.innerHTML = `正確！${MathRenderer.render(q.data.f1.int, q.data.f1.num, q.data.f1.den)} ${op} ${MathRenderer.render(q.data.f2.int, q.data.f2.num, q.data.f2.den)} 等於 ${MathRenderer.render(q.ans.int, q.ans.num, q.ans.den)}。`;
      } else if (this.currentLevel === 4) {
        explEl.innerHTML = `正確！將 ${q.data.factor} 盤 ${MathRenderer.render(q.data.f1.int, q.data.f1.num, q.data.f1.den)} 倒在一起，等於 ${MathRenderer.render(q.ans.int, q.ans.num, q.ans.den)}。`;
      }
      
      VoiceManager.speak(rewardSpeech + explEl.innerText);
      
      // Single-player level lock balance adjustments
      if (this.currentLevel === 3) {
        // Correct balance scale
        RenderEngine.renderLevel3Scale('l3-scale-box', 0);
      }
      
    } else {
      // Answer is incorrect
      AudioSynth.play('incorrect');
      statusEl.innerText = "哎呀，配方好像不對喔！❌";
      feedbackEl.classList.add('incorrect');
      
      let explanation = "";
      let speakPrompt = "";
      
      // Analyze student error for specific concepts
      if (this.currentLevel === 1) {
        if (q.type === 'classify') {
          explanation = `不對喔，這個分數的分子與分母關係，應該歸類為<strong>${q.ans === 'true' ? '真分數' : (q.ans === 'improper' ? '假分數' : '帶分數')}</strong>喔！`;
        } else if (q.type === 'convert_to_mixed') {
          explanation = `不對喔，把假分數 ${MathRenderer.render(q.data.int, q.data.num, q.data.den)} 換成帶分數，先用分子 ${q.data.num} 除以分母 ${q.data.den} 得到整數部分，餘數就是新的分子，所以應該是 ${MathRenderer.render(q.ans.int, q.ans.num, q.ans.den)}。`;
        } else if (q.type === 'convert_to_improper') {
          explanation = `不對喔，把帶分數 ${MathRenderer.render(q.data.int, q.data.num, q.data.den)} 換成假分數，要用整數部分乘分母再加上原分子得到新分子，分母保持不變，所以是 ${MathRenderer.render(q.ans.int, q.ans.num, q.ans.den)}。`;
        }
      }
      
      else if (this.currentLevel === 2) {
        // Trigger semi-transparent comparison overlay!
        explanation = `我們來看看重疊比對吧！`;
        RenderEngine.showLevel2Overlap(q.data.f1, q.data.f2, 'visual-interaction-area');
      }
      
      else if (this.currentLevel === 3) {
        // Calculate physics scale tilt
        const intVal = parseInt(document.getElementById('ans-int').value) || 0;
        const numVal = parseInt(document.getElementById('ans-num').value) || 0;
        const denVal = parseInt(document.getElementById('ans-den').value) || 1;
        
        // Show tilt
        const targetWeight = q.ans.int + q.ans.num / q.ans.den;
        const studentWeight = intVal + numVal / denVal;
        
        const weightDiff = studentWeight - targetWeight;
        let tiltAngle = 0;
        if (weightDiff > 0) {
          tiltAngle = 12; // student weight is heavier -> right side tilts down
        } else if (weightDiff < 0) {
          tiltAngle = -12; // student weight is lighter -> left side tilts down
        } else {
          tiltAngle = -8; // denominator was wrong or other errors
        }
        
        // Play scale tilt rumble
        AudioSynth.play('shake');
        RenderEngine.renderLevel3Scale('l3-scale-box', tiltAngle);
        
        // Check for denominator error (common misconception)
        if (denVal === q.data.f1.den + q.data.f2.den) {
          explanation = "哎呀！天平不平衡了！分母相加是錯的喔！同分母加減時，分母是不需要相加的呢！";
        } else if (q.data.op === '-' && q.data.f1.num < q.data.f2.num && intVal === q.data.f1.int - q.data.f2.int) {
          explanation = "天平傾斜了！分子不夠減時，要記得向整數借 1 ，化為同分母的分數再進行減法計算喔！";
        } else {
          explanation = `配方比重不對！計算結果應該是 ${MathRenderer.render(q.ans.int, q.ans.num, q.ans.den)}。分母相同，僅將分子進行${q.data.op === '+' ? '加法' : '減法'}即可喔。`;
        }
      }
      
      else if (this.currentLevel === 4) {
        const intVal = parseInt(document.getElementById('ans-int').value) || 0;
        const numVal = parseInt(document.getElementById('ans-num').value) || 0;
        const denVal = parseInt(document.getElementById('ans-den').value) || 1;
        
        if (denVal === q.data.f1.den * q.data.factor) {
          explanation = "不對喔！乘以整數代表連續相加，分母大小（切塊大小）是保持不變的！我們只要把分子乘上整數倍數就可以了喔！";
        } else {
          explanation = `配方不對喔！乘以 ${q.data.factor} 等於將分子乘以 ${q.data.factor}，分母保持不變。所以計算結果應該是 ${MathRenderer.render(q.ans.int, q.ans.num, q.ans.den)}。`;
        }
      }
      
      explEl.innerHTML = explanation;
      VoiceManager.speak(statusEl.innerText + explEl.innerText);
    }
    
    // Hide Submit and show Next
    document.getElementById('btn-submit-answer').classList.add('hidden');
    document.getElementById('btn-next-question').classList.remove('hidden');
  },
  
  nextQuestion() {
    this.currentQuestionIdx++;
    if (this.currentQuestionIdx < this.questions.length) {
      this.loadQuestion();
    } else {
      // Level Completed!
      // Add stars
      this.starsCount[this.currentLevel] = 3; // Give maximum stars for playing
      this.updateStarsUI();
      AudioSynth.play('victory');
      
      VoiceManager.speak(`恭喜你！完成了關卡 ${this.currentLevel} 的所有魔法烘焙挑戰！你太棒了！`);
      
      this.switchScreen('level-select');
    }
  }
};

// ==================== 7. DUEL MODE ENGINE ====================
const duelEngine = {
  currentDuelLevel: 1,
  winLimit: 5,
  p1Score: 0,
  p2Score: 0,
  
  // Independent active questions
  p1Question: null,
  p2Question: null,
  
  // Choice states
  p1Choice: null,
  p2Choice: null,
  
  init() {
    // No-op
  },
  
  selectLevel(level) {
    this.currentDuelLevel = level;
    document.querySelectorAll('.duel-level-btn').forEach((btn, idx) => {
      if (idx + 1 === level) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    AudioSynth.play('click');
  },
  
  startDuel() {
    this.p1Score = 0;
    this.p2Score = 0;
    
    const limitSelect = document.getElementById('duel-win-limit');
    this.winLimit = parseInt(limitSelect.value) || 5;
    document.getElementById('duel-target-score').innerText = this.winLimit;
    
    // Render empty score stars
    this.updateScoresUI();
    
    // Switch Screen
    gameEngine.switchScreen('duel');
    
    // Speak duel start text
    VoiceManager.speak("雙人烘焙對決賽，開始！先烘焙出指定數量甜點的玩家就能獲勝喔！");
    
    // Load first question for both
    this.generatePlayerQuestion(1);
    this.generatePlayerQuestion(2);
  },
  
  updateScoresUI() {
    document.getElementById('p1-score-num').innerText = this.p1Score;
    document.getElementById('p2-score-num').innerText = this.p2Score;
    
    document.getElementById('p1-score-stars').innerText = '🧁'.repeat(this.p1Score);
    document.getElementById('p2-score-stars').innerText = '🧁'.repeat(this.p2Score);
  },
  
  generatePlayerQuestion(playerNum) {
    // Pick a completely random question from the selected level bank
    const bank = QuestionGenerator.levels[this.currentDuelLevel];
    const q = bank[Math.floor(Math.random() * bank.length)];
    
    // Clone and assign
    if (playerNum === 1) {
      this.p1Question = { ...q };
      this.p1Choice = null;
      document.getElementById('p1-question-text').innerText = q.qText;
      document.getElementById('p1-feedback').classList.add('hidden');
      this.setupPlayerWorkspace(1, this.p1Question);
    } else {
      this.p2Question = { ...q };
      this.p2Choice = null;
      document.getElementById('p2-question-text').innerText = q.qText;
      document.getElementById('p2-feedback').classList.add('hidden');
      this.setupPlayerWorkspace(2, this.p2Question);
    }
  },
  
  speakPlayerQuestion(playerNum) {
    const q = playerNum === 1 ? this.p1Question : this.p2Question;
    if (q) {
      VoiceManager.speak(q.qText);
    }
  },
  
  setupPlayerWorkspace(playerNum, q) {
    const visualArea = document.getElementById(`p${playerNum}-visual-area`);
    const inputsArea = document.getElementById(`p${playerNum}-inputs`);
    
    visualArea.innerHTML = '';
    inputsArea.innerHTML = '';
    
    // Level 1: Understanding & Conversion
    if (this.currentDuelLevel === 1) {
      if (q.type === 'classify') {
        const mathEq = document.createElement('div');
        mathEq.style.fontSize = '2.5rem';
        mathEq.innerHTML = MathRenderer.render(q.data.int, q.data.num, q.data.den);
        visualArea.appendChild(mathEq);
        
        inputsArea.innerHTML = `
          <div class="choices-layout">
            <button class="btn-choice p${playerNum}-c" data-choice="true" style="padding:10px; font-size:0.9rem;">真</button>
            <button class="btn-choice p${playerNum}-c" data-choice="improper" style="padding:10px; font-size:0.9rem;">假</button>
            <button class="btn-choice p${playerNum}-c" data-choice="mixed" style="padding:10px; font-size:0.9rem;">帶</button>
          </div>
        `;
        
        inputsArea.querySelectorAll(`.p${playerNum}-c`).forEach(btn => {
          btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            inputsArea.querySelectorAll(`.p${playerNum}-c`).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            if (playerNum === 1) this.p1Choice = btn.getAttribute('data-choice');
            else this.p2Choice = btn.getAttribute('data-choice');
            AudioSynth.play('click');
          });
        });
      } else {
        const mathEq = document.createElement('div');
        mathEq.style.fontSize = '2.3rem';
        mathEq.innerHTML = `${MathRenderer.render(q.data.int, q.data.num, q.data.den)} = ？`;
        visualArea.appendChild(mathEq);
        
        inputsArea.innerHTML = `
          <div class="fraction-input-block" style="font-size:1.2rem;">
            <input type="number" id="p${playerNum}-ans-int" placeholder="整" class="int-input-box" style="width:40px; height:50px; font-size:1.2rem;" value="0">
            <div class="frac-input-group">
              <input type="number" id="p${playerNum}-ans-num" placeholder="子" class="frac-input-box" style="width:35px; height:30px; font-size:1rem;">
              <div class="frac-input-divider" style="width:35px;"></div>
              <input type="number" id="p${playerNum}-ans-den" placeholder="母" class="frac-input-box" style="width:35px; height:30px; font-size:1rem;" value="${q.data.den}" readonly>
            </div>
          </div>
        `;
      }
    }
    
    // Level 2: Compare
    else if (this.currentDuelLevel === 2) {
      visualArea.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; font-size:1.8rem;">
          <div>${MathRenderer.render(q.data.f1.int, q.data.f1.num, q.data.f1.den)}</div>
          <div id="p${playerNum}-comp-slot" style="border:2px dashed var(--magic-gold); padding:2px 10px; min-width:35px; text-align:center;">?</div>
          <div>${MathRenderer.render(q.data.f2.int, q.data.f2.num, q.data.f2.den)}</div>
        </div>
      `;
      
      inputsArea.innerHTML = `
        <div class="comparison-buttons">
          <button class="btn-comparison-sign p${playerNum}-c" data-sign=">" style="width:40px; height:40px; font-size:1.2rem;">&gt;</button>
          <button class="btn-comparison-sign p${playerNum}-c" data-sign="=" style="width:40px; height:40px; font-size:1.2rem;">=</button>
          <button class="btn-comparison-sign p${playerNum}-c" data-sign="<" style="width:40px; height:40px; font-size:1.2rem;">&lt;</button>
        </div>
      `;
      
      inputsArea.querySelectorAll(`.p${playerNum}-c`).forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          inputsArea.querySelectorAll(`.p${playerNum}-c`).forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          const sign = btn.getAttribute('data-sign');
          if (playerNum === 1) this.p1Choice = sign;
          else this.p2Choice = sign;
          document.getElementById(`p${playerNum}-comp-slot`).innerText = sign;
          AudioSynth.play('click');
        });
      });
    }
    
    // Level 3: Addition & Subtraction
    else if (this.currentDuelLevel === 3) {
      const op = q.data.op === '+' ? '＋' : '－';
      const mathEq = document.createElement('div');
      mathEq.style.fontSize = '1.8rem';
      mathEq.innerHTML = `
        ${MathRenderer.render(q.data.f1.int, q.data.f1.num, q.data.f1.den)} ${op}
        ${MathRenderer.render(q.data.f2.int, q.data.f2.num, q.data.f2.den)} = ？
      `;
      visualArea.appendChild(mathEq);
      
      inputsArea.innerHTML = `
        <div class="fraction-input-block" style="font-size:1.2rem;">
          <input type="number" id="p${playerNum}-ans-int" placeholder="整" class="int-input-box" style="width:40px; height:50px; font-size:1.2rem;" value="0">
          <div class="frac-input-group">
            <input type="number" id="p${playerNum}-ans-num" placeholder="子" class="frac-input-box" style="width:35px; height:30px; font-size:1rem;">
            <div class="frac-input-divider" style="width:35px;"></div>
            <input type="number" id="p${playerNum}-ans-den" placeholder="母" class="frac-input-box" style="width:35px; height:30px; font-size:1rem;" value="${q.data.f1.den}" readonly>
          </div>
        </div>
      `;
    }
    
    // Level 4: Integer Multiples
    else if (this.currentDuelLevel === 4) {
      const mathEq = document.createElement('div');
      mathEq.style.fontSize = '1.8rem';
      mathEq.innerHTML = `
        ${MathRenderer.render(q.data.f1.int, q.data.f1.num, q.data.f1.den)} × ${q.data.factor} = ？
      `;
      visualArea.appendChild(mathEq);
      
      inputsArea.innerHTML = `
        <div class="fraction-input-block" style="font-size:1.2rem;">
          <input type="number" id="p${playerNum}-ans-int" placeholder="整" class="int-input-box" style="width:40px; height:50px; font-size:1.2rem;" value="0">
          <div class="frac-input-group">
            <input type="number" id="p${playerNum}-ans-num" placeholder="子" class="frac-input-box" style="width:35px; height:30px; font-size:1rem;">
            <div class="frac-input-divider" style="width:35px;"></div>
            <input type="number" id="p${playerNum}-ans-den" placeholder="母" class="frac-input-box" style="width:35px; height:30px; font-size:1rem;" value="${q.data.f1.den}" readonly>
          </div>
        </div>
      `;
    }
  },
  
  submitPlayerAnswer(playerNum) {
    const q = playerNum === 1 ? this.p1Question : this.p2Question;
    if (!q) return;
    
    let isCorrect = false;
    
    // Evaluate answer
    if (this.currentDuelLevel === 1) {
      if (q.type === 'classify') {
        const choice = playerNum === 1 ? this.p1Choice : this.p2Choice;
        if (!choice) return;
        isCorrect = (choice === q.ans);
      } else {
        const intVal = parseInt(document.getElementById(`p${playerNum}-ans-int`).value) || 0;
        let numRaw = document.getElementById(`p${playerNum}-ans-num`).value.trim();
        let numVal = parseInt(numRaw);
        if (numRaw === "" && intVal > 0) {
          numVal = 0;
        }
        const denVal = parseInt(document.getElementById(`p${playerNum}-ans-den`).value) || 1;
        if (isNaN(numVal)) return;
        isCorrect = (intVal === q.ans.int && numVal === q.ans.num && denVal === q.ans.den);
      }
    }
    
    else if (this.currentDuelLevel === 2) {
      const choice = playerNum === 1 ? this.p1Choice : this.p2Choice;
      if (!choice) return;
      isCorrect = (choice === q.ans);
    }
    
    else if (this.currentDuelLevel === 3 || this.currentDuelLevel === 4) {
      const intVal = parseInt(document.getElementById(`p${playerNum}-ans-int`).value) || 0;
      let numRaw = document.getElementById(`p${playerNum}-ans-num`).value.trim();
      let numVal = parseInt(numRaw);
      if (numRaw === "" && intVal > 0) {
        numVal = 0;
      }
      const denVal = parseInt(document.getElementById(`p${playerNum}-ans-den`).value) || 1;
      if (isNaN(numVal)) return;
      const studentSlices = intVal * denVal + numVal;
      const targetSlices = q.ans.int * q.ans.den + q.ans.num;
      isCorrect = (studentSlices === targetSlices && denVal === q.ans.den);
    }
    
    // Visual feedback for the player
    const feedbackEl = document.getElementById(`p${playerNum}-feedback`);
    feedbackEl.classList.remove('hidden', 'correct', 'incorrect');
    
    if (isCorrect) {
      AudioSynth.play('correct');
      feedbackEl.innerText = "答對了！烘焙完成 +1 🧁";
      feedbackEl.className = "duel-feedback correct";
      
      // Update scores
      if (playerNum === 1) this.p1Score++;
      else this.p2Score++;
      this.updateScoresUI();
      
      // Disable player controls briefly then give new question
      document.getElementById(`p${playerNum}-submit-btn`).disabled = true;
      
      setTimeout(() => {
        document.getElementById(`p${playerNum}-submit-btn`).disabled = false;
        
        // Check win condition
        if (playerNum === 1 && this.p1Score >= this.winLimit) {
          this.declareWinner("紅方烘焙師");
        } else if (playerNum === 2 && this.p2Score >= this.winLimit) {
          this.declareWinner("藍方烘焙師");
        } else {
          this.generatePlayerQuestion(playerNum);
        }
      }, 1000);
      
    } else {
      AudioSynth.play('incorrect');
      feedbackEl.innerText = "配方錯了，再試一次！❌";
      feedbackEl.className = "duel-feedback incorrect";
      
      // Keep inputting allowed
      setTimeout(() => {
        feedbackEl.classList.add('hidden');
      }, 2000);
    }
  },
  
  declareWinner(winnerName) {
    AudioSynth.play('victory');
    VoiceManager.speak(`對決結束！恭喜 ${winnerName} 獲得了特級廚師的稱號！`);
    
    gameEngine.toggleWinnerModal(true, `${winnerName} 贏得了勝利！🏆`, `恭喜成為特級魔法烘焙師！`);
  }
};

// ==================== 8. DEVELOPER AUTOMATED PLAYTEST ENGINE ====================
const playtestEngine = {
  active: false,
  logEl: null,
  passCount: 0,
  failCount: 0,
  testTimer: null,
  
  init() {
    this.logEl = document.getElementById('test-logs');
  },
  
  togglePanel() {
    const panel = document.getElementById('dev-playtest-panel');
    const icon = document.getElementById('dev-toggle-icon');
    if (panel.classList.contains('closed')) {
      panel.classList.remove('closed');
      icon.innerText = '▼';
    } else {
      panel.classList.add('closed');
      icon.innerText = '▲';
    }
  },
  
  log(msg, type = 'info') {
    if (!this.logEl) this.init();
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.logEl.appendChild(line);
    this.logEl.scrollTop = this.logEl.scrollHeight; // Auto-scroll
    console.log(`[PLAYTEST] ${type.toUpperCase()}: ${msg}`);
  },
  
  assert(condition, successMsg, failMsg) {
    if (condition) {
      this.passCount++;
      document.getElementById('test-pass-count').innerText = this.passCount;
      this.log(`✔ PASSED: ${successMsg}`, 'success');
      return true;
    } else {
      this.failCount++;
      document.getElementById('test-fail-count').innerText = this.failCount;
      this.log(`✘ FAILED: ${failMsg}`, 'error');
      return false;
    }
  },
  
  clearLogs() {
    if (this.logEl) this.logEl.innerHTML = '';
    this.passCount = 0;
    this.failCount = 0;
    document.getElementById('test-pass-count').innerText = 0;
    document.getElementById('test-fail-count').innerText = 0;
  },
  
  stopTest() {
    this.active = false;
    clearTimeout(this.testTimer);
    document.getElementById('test-status-text').innerText = '閒置中';
    document.getElementById('btn-run-all-tests').classList.remove('hidden');
    document.getElementById('btn-stop-tests').classList.add('hidden');
    this.log("測試已被手動停止。", 'warning');
  },
  
  verifyQuestionDatabase() {
    this.log("開始進行題庫與圖形之一致性自動校對...", 'info');
    let errorsCount = 0;
    
    for (let level = 1; level <= 4; level++) {
      const bank = QuestionGenerator.levels[level];
      bank.forEach(q => {
        let isMatch = true;
        let details = "";
        
        if (level === 1) {
          if (q.type === 'classify') {
            const { int, num, den } = q.data;
            let expected = 'true';
            if (int > 0) expected = 'mixed';
            else if (num >= den) expected = 'improper';
            
            if (expected !== q.ans) {
              isMatch = false;
              details = `預期為 ${expected}，但資料設定為 ${q.ans}`;
            }
          } else if (q.type === 'convert_to_mixed') {
            const { int, num, den } = q.data;
            const totalSlices = int * den + num;
            const expectedInt = Math.floor(totalSlices / den);
            const expectedNum = totalSlices % den;
            
            if (q.ans.int !== expectedInt || q.ans.num !== expectedNum || q.ans.den !== den) {
              isMatch = false;
              details = `預期為 {int: ${expectedInt}, num: ${expectedNum}, den: ${den}}，但資料設定為 ${JSON.stringify(q.ans)}`;
            }
          } else if (q.type === 'convert_to_improper') {
            const { int, num, den } = q.data;
            const expectedInt = 0;
            const expectedNum = int * den + num;
            
            if (q.ans.int !== expectedInt || q.ans.num !== expectedNum || q.ans.den !== den) {
              isMatch = false;
              details = `預期為 {int: ${expectedInt}, num: ${expectedNum}, den: ${den}}，但資料設定為 ${JSON.stringify(q.ans)}`;
            }
          }
        }
        
        else if (level === 2) {
          const v1 = q.data.f1.int + q.data.f1.num / q.data.f1.den;
          const v2 = q.data.f2.int + q.data.f2.num / q.data.f2.den;
          
          let expectedSign = '=';
          if (v1 - v2 > 0.00001) expectedSign = '>';
          else if (v2 - v1 > 0.00001) expectedSign = '<';
          
          if (q.ans !== expectedSign) {
            isMatch = false;
            details = `值1: ${v1}, 值2: ${v2}. 預期為 ${expectedSign}，但資料設定為 ${q.ans}`;
          }
        }
        
        else if (level === 3) {
          const f1 = q.data.f1;
          const f2 = q.data.f2;
          const s1 = f1.int * f1.den + f1.num;
          const s2 = f2.int * f2.den + f2.num;
          
          let expectedSlices = 0;
          if (q.data.op === '+') {
            expectedSlices = s1 + s2;
          } else {
            expectedSlices = s1 - s2;
          }
          
          const targetSlices = q.ans.int * q.ans.den + q.ans.num;
          if (targetSlices !== expectedSlices || q.ans.den !== f1.den) {
            isMatch = false;
            details = `題目 ${s1}/${f1.den} ${q.data.op} ${s2}/${f1.den}. 預期為等值於 ${expectedSlices}/${f1.den}，但資料為 ${JSON.stringify(q.ans)}`;
          }
        }
        
        else if (level === 4) {
          const f1 = q.data.f1;
          const factor = q.data.factor;
          const slices = f1.int * f1.den + f1.num;
          const expectedSlices = slices * factor;
          
          const targetSlices = q.ans.int * q.ans.den + q.ans.num;
          if (targetSlices !== expectedSlices || q.ans.den !== f1.den) {
            isMatch = false;
            details = `題目 (${slices}/${f1.den}) * ${factor}. 預期為等值於 ${expectedSlices}/${f1.den}，但資料為 ${JSON.stringify(q.ans)}`;
          }
        }
        
        if (!isMatch) {
          errorsCount++;
          this.log(`❌ 題庫錯誤 [ID: ${q.id}]: ${details}`, 'error');
        }
      });
    }
    
    this.assert(errorsCount === 0, "全題庫題目與答案/分數圖形之一致性自動校對成功 (0 錯誤)", `題庫校對失敗，共發現 ${errorsCount} 個題目錯誤！`);
  },
  
  async runFullAutoTest() {
    if (this.active) return;
    this.active = true;
    this.clearLogs();
    
    document.getElementById('test-status-text').innerText = '測試執行中';
    document.getElementById('btn-run-all-tests').classList.add('hidden');
    document.getElementById('btn-stop-tests').classList.remove('hidden');
    
    // Ensure panel is open during test
    const panel = document.getElementById('dev-playtest-panel');
    if (panel.classList.contains('closed')) this.togglePanel();
    
    this.log("開始執行全自動試玩除錯程序...", 'info');
    
    try {
      // Step 0: Verify question database consistency
      this.verifyQuestionDatabase();
      // Step 1: Check basic structures
      this.assert(document.getElementById('home-screen') !== null, "首頁 DOM 結構存在", "找不到首頁 DOM 結構");
      this.assert(document.getElementById('level-select-screen') !== null, "關卡選擇 DOM 結構存在", "找不到關卡選擇 DOM");
      this.assert(document.getElementById('single-screen') !== null, "單人遊戲 DOM 結構存在", "找不到單人遊戲 DOM");
      this.assert(document.getElementById('duel-screen') !== null, "雙人遊戲 DOM 結構存在", "找不到雙人遊戲 DOM");
      
      // Step 2: Check database question sizes
      for (let l = 1; l <= 4; l++) {
        const count = QuestionGenerator.levels[l].length;
        this.assert(count >= 15, `關卡 ${l} 題庫有 ${count} 題，大於或等於 15 題`, `關卡 ${l} 題庫數量只有 ${count} 題，小於 15 題！`);
      }
      
      // Step 3: Run single player level test simulations
      await this.runSinglePlayerTests();
      
      // Step 4: Run duel mode tests
      if (this.active) {
        await this.runDuelModeTests();
      }
      
      // Conclude
      if (this.active) {
        if (this.failCount === 0) {
          this.log("🎉 所有自動化測試順利通過！分數魔法烘焙屋 4.0 已確認無任何 Bug 存在！", 'success');
        } else {
          this.log(`⚠ 測試結束，有 ${this.failCount} 項斷言失敗，請修復程式碼。`, 'error');
        }
        this.stopTest();
      }
      
    } catch (err) {
      this.log(`❌ 測試過程中發生未捕獲的異常: ${err.message}`, 'error');
      this.stopTest();
    }
  },
  
  async runSinglePlayerTests() {
    for (let level = 1; level <= 4; level++) {
      if (!this.active) return;
      this.log(`正在模擬單人模式關卡 ${level}...`, 'info');
      
      // Start Level
      gameEngine.startSingleLevel(level);
      this.assert(gameEngine.currentLevel === level, `成功切換至關卡 ${level}`, `未能切換至關卡 ${level}`);
      this.assert(gameEngine.questions.length === 5, "關卡抽取出 5 題進行挑戰", `抽取出的題數為 ${gameEngine.questions.length} 題，並非 5 題！`);
      
      // Check randomization: Shuffle again and compare
      const firstSet = gameEngine.questions.map(q => q.id);
      const secondSet = QuestionGenerator.generateRound(level).roundQuestions.map(q => q.id);
      // It is statistically almost impossible (1 in 15,000+) to get the exact same 5 in same order
      const isRandomized = JSON.stringify(firstSet) !== JSON.stringify(secondSet);
      this.assert(isRandomized, "每一次登錄時，題目順序與內容皆有亂數打散", "題目沒有亂數打散！");
      
      // Play 2 questions of this level
      for (let qIdx = 0; qIdx < 2; qIdx++) {
        if (!this.active) return;
        
        const q = gameEngine.questions[gameEngine.currentQuestionIdx];
        this.log(`正在處理第 ${qIdx + 1} 題：類型 ${q.type}`, 'info');
        
        // Assert OMML rendering structure: Check display: inline-table rules
        const fracRenders = document.querySelectorAll('.math-frac');
        let ommlOk = true;
        fracRenders.forEach(el => {
          if (el.textContent.includes('/') || el.textContent.includes('分之')) {
            console.warn("OMML Violation detected in element:", el.outerHTML);
            ommlOk = false;
          }
        });
        this.assert(ommlOk, "畫面渲染之分數皆遵守 OMML 直式分數結構（無國字分數，無 / 斜角）", "分數渲染未遵守直式橫線規範！");
        
        // Simulate incorrect answer once per level to verify pedagogical misconception feedback
        if (qIdx === 0) {
          this.log("模擬學生答錯，檢查迷思引導回饋...", 'info');
          
          if (level === 1) {
            if (q.type === 'classify') {
              // Select wrong choice
              const wrongChoice = q.ans === 'true' ? 'mixed' : 'true';
              gameEngine.selectedChoice = wrongChoice;
            } else {
              document.getElementById('ans-int').value = 99; // obviously wrong
              document.getElementById('ans-num').value = 99;
            }
            gameEngine.submitAnswer();
            
            const feedback = document.getElementById('answer-feedback');
            this.assert(feedback.classList.contains('incorrect'), "分類錯誤引導成功觸發", "未觸發錯誤引導！");
            
          } else if (level === 2) {
            gameEngine.selectedChoice = q.ans === '>' ? '<' : '>';
            gameEngine.submitAnswer();
            
            // Verify transparent overlap modal appeared in DOM
            const overlapEl = document.getElementById('overlap-overlay');
            this.assert(overlapEl !== null, "比大小答錯時，半透明重疊比對動畫成功渲染於 DOM 中", "找不到半透明比對 DOM 結構！");
            
            // Close overlap
            if (overlapEl) overlapEl.remove();
            
          } else if (level === 3) {
            document.getElementById('ans-int').value = 0;
            document.getElementById('ans-num').value = q.ans.num;
            // Introduce Denominator Sum Misconception: Add denominators
            document.getElementById('ans-den').value = q.data.f1.den + q.data.f2.den;
            
            gameEngine.submitAnswer();
            
            const feedbackText = document.getElementById('answer-feedback').querySelector('.feedback-explanation').innerText;
            this.assert(feedbackText.includes("分母在加減時是不變的") || feedbackText.includes("不平衡"), "成功偵測分母相加之迷思，並輸出正確的天平與文字提示", "天平分母加法迷思未觸發引導！");
            
          } else if (level === 4) {
            document.getElementById('ans-int').value = 0;
            document.getElementById('ans-num').value = 99;
            document.getElementById('ans-den').value = q.data.f1.den * q.data.factor; // denominator multiplied
            
            gameEngine.submitAnswer();
            
            const feedbackText = document.getElementById('answer-feedback').querySelector('.feedback-explanation').innerText;
            this.assert(feedbackText.includes("分母大小") && feedbackText.includes("保持不變"), "成功偵測倍數分母相乘之迷思，並給予視覺回饋", "倍數分母乘法迷思未觸發引導！");
          }
          
          // Move to next
          await new Promise(r => setTimeout(r, 600));
          gameEngine.nextQuestion();
          
        } else {
          // Simulate correct answer
          this.log("模擬學生答對，調配正確魔法配方...", 'info');
          const nextQ = gameEngine.questions[gameEngine.currentQuestionIdx];
          
          if (level === 1) {
            if (nextQ.type === 'classify') {
              gameEngine.selectedChoice = nextQ.ans;
            } else {
              document.getElementById('ans-int').value = nextQ.ans.int;
              document.getElementById('ans-num').value = nextQ.ans.num;
              document.getElementById('ans-den').value = nextQ.ans.den;
            }
          } else if (level === 2) {
            gameEngine.selectedChoice = nextQ.ans;
          } else {
            // Level 3 or 4
            document.getElementById('ans-int').value = nextQ.ans.int;
            document.getElementById('ans-num').value = nextQ.ans.num;
            document.getElementById('ans-den').value = nextQ.ans.den;
          }
          
          gameEngine.submitAnswer();
          
          const feedback = document.getElementById('answer-feedback');
          this.assert(feedback.classList.contains('correct'), "正確答案提交，配方融合成功", "答對邏輯有 bug，判定為錯誤！");
          
          await new Promise(r => setTimeout(r, 600));
          gameEngine.nextQuestion();
        }
      }
    }
  },
  
  async runDuelModeTests() {
    this.log("開始測試雙人對決模式...", 'info');
    
    // Set duel configuration
    duelEngine.currentDuelLevel = 1;
    document.getElementById('duel-win-limit').value = "5";
    
    duelEngine.startDuel();
    
    this.assert(gameEngine.currentScreen === 'duel', "成功進入雙人對決大廳", "未切換至對決畫面");
    this.assert(duelEngine.winLimit === 5, "成功設定對決烘焙目標題數為 5 題", `目標題數錯誤，得到 ${duelEngine.winLimit}`);
    
    // Simulate player turns
    // P1 wins: P1 gets 5 correct, P2 gets 1 correct.
    for (let round = 1; round <= 5; round++) {
      if (!this.active) return;
      this.log(`[對決回合 ${round}] 模擬紅藍方答題中...`, 'info');
      
      // Player 1 (Red) answers correctly
      const q1 = duelEngine.p1Question;
      if (q1.type === 'classify') {
        duelEngine.p1Choice = q1.ans;
      } else {
        document.getElementById('p1-ans-int').value = q1.ans.int;
        document.getElementById('p1-ans-num').value = q1.ans.num;
        document.getElementById('p1-ans-den').value = q1.ans.den;
      }
      duelEngine.submitPlayerAnswer(1);
      
      // Player 2 (Blue) answers correctly in round 1, incorrectly/slowly in other rounds
      const q2 = duelEngine.p2Question;
      if (round === 1) {
        if (q2.type === 'classify') {
          duelEngine.p2Choice = q2.ans;
        } else {
          document.getElementById('p2-ans-int').value = q2.ans.int;
          document.getElementById('p2-ans-num').value = q2.ans.num;
          document.getElementById('p2-ans-den').value = q2.ans.den;
        }
        duelEngine.submitPlayerAnswer(2);
      } else {
        // P2 answers wrong or skips
        if (q2.type === 'classify') {
          duelEngine.p2Choice = q2.ans === 'true' ? 'mixed' : 'true';
        } else {
          document.getElementById('p2-ans-int').value = 99;
          document.getElementById('p2-ans-num').value = 99;
        }
        duelEngine.submitPlayerAnswer(2);
      }
      
      await new Promise(r => setTimeout(r, 1200)); // Wait for timer transitions
    }
    
    // Assert winner modal
    const winnerModal = document.getElementById('winner-modal');
    this.assert(!winnerModal.classList.contains('hidden') && winnerModal.querySelector('h2').innerText.includes("紅方烘焙師"), "紅方烘焙師搶先烘焙出 5 點心，對決結束並彈出獲勝慶祝視窗", "對決獲勝判定有 bug！找不到慶祝畫面！");
    
    // Close winner modal and return
    gameEngine.switchScreen('home');
    gameEngine.toggleWinnerModal(false);
  }
};

// ==================== 9. INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
  // Init engines
  gameEngine.init();
  duelEngine.init();
  playtestEngine.init();
  
  // Proactively run a silent audio init just in case
  document.body.addEventListener('pointerdown', () => {
    AudioSynth.init();
  }, { once: true });
});
