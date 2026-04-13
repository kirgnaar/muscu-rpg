/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — timer.js
   Gestion du chronomètre de repos
   ══════════════════════════════════════════════════════════════════════════ */

var TIMER = {
  duration: 90,     // Durée par défaut en secondes
  remaining: 0,
  interval: null,
  isActive: false,

  init: function() {
    this.render();
    this.attachListeners();
  },

  attachListeners: function() {
    var self = this;
    $('timer-start-btn').addEventListener('click', function() {
      self.start();
    });
    $('timer-stop-btn').addEventListener('click', function() {
      self.stop();
    });
    $('timer-reset-btn').addEventListener('click', function() {
      self.reset();
    });
    
    // Sélection de durée rapide
    var timerOpts = $$('.timer-opt');
    for (var i = 0; i < timerOpts.length; i++) {
      timerOpts[i].addEventListener('click', function() {
        var d = parseInt(this.dataset.d);
        self.setDuration(d);
      });
    }
  },

  setDuration: function(seconds) {
    this.duration = seconds;
    this.remaining = seconds;
    this.updateDisplay();
    var timerOpts = $$('.timer-opt');
    for (var i = 0; i < timerOpts.length; i++) {
      timerOpts[i].classList.toggle('active', parseInt(timerOpts[i].dataset.d) === seconds);
    }
  },

  start: function() {
    if (this.isActive) return;
    if (this.remaining <= 0) this.remaining = this.duration;
    
    var self = this;
    this.isActive = true;
    $('timer-card').classList.add('running');
    $('timer-start-btn').style.display = 'none';
    $('timer-stop-btn').style.display = 'inline-block';
    
    this.interval = setInterval(function() {
      self.remaining--;
      self.updateDisplay();
      
      if (self.remaining <= 0) {
        self.complete();
      }
    }, 1000);
  },

  stop: function() {
    clearInterval(this.interval);
    this.isActive = false;
    $('timer-card').classList.remove('running');
    $('timer-start-btn').style.display = 'inline-block';
    $('timer-stop-btn').style.display = 'none';
  },

  reset: function() {
    this.stop();
    this.remaining = this.duration;
    this.updateDisplay();
  },

  complete: function() {
    this.stop();
    toast('⌛ Repos terminé !', 'pr');
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }
    // Optionnel: petit bip sonore
    this.playBeep();
  },

  updateDisplay: function() {
    var m = Math.floor(this.remaining / 60);
    var s = this.remaining % 60;
    var timeStr = m + ':' + (s < 10 ? '0' : '') + s;
    $('timer-display').textContent = timeStr;
    
    // Update circular progress if we add it later
    var progress = (this.remaining / this.duration) * 100;
    $('timer-progress').style.width = progress + '%';
  },

  render: function() {
    // Le HTML est déjà dans index.html, on s'assure juste de l'état initial
    this.updateDisplay();
  },

  playBeep: function() {
    try {
      var context = new (window.AudioContext || window.webkitAudioContext)();
      var osc = context.createOscillator();
      var gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.5);
    } catch(e) {
      console.warn("Audio not supported", e);
    }
  }
};
