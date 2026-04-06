/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/back.js
   Vue de dos via body-highlighter CDN + fallback SVG
══════════════════════════════════════════════════════════════════════════ */

var BACK_MUSCLE_MAP = {
  'Trapèzes':        ['trapezius'],
  'Épaules':         ['back-deltoids'],
  'Triceps':         ['triceps'],
  'Dorsal':          ['lats'],
  'Lombaires':       ['lower-back'],
  'Fessiers':        ['gluteal'],
  'Ischio-jambiers': ['hamstring'],
  'Mollets':         ['calves'],
};

function buildBodyBack() {
  if (!window.BODY_HIGHLIGHTER_FAILED && _bodyHighlighterAvailable()) {
    return _buildHighlighterSVG('posterior', BACK_MUSCLE_MAP);
  }
  return _fallbackBack();
}

function _fallbackBack() {
  function tc(m){ var n=seriesCountByGroup(m); return n>0?getTier(n).col:'none'; }
  function op(m){ var n=seriesCountByGroup(m); return n>0?'0.58':'0'; }
  var tr=tc('Trapèzes'),otr=op('Trapèzes'),ep=tc('Épaules'),oep=op('Épaules');
  var tri=tc('Triceps'),otri=op('Triceps'),do_=tc('Dorsal'),odo=op('Dorsal');
  var lo=tc('Lombaires'),olo=op('Lombaires'),fe=tc('Fessiers'),ofe=op('Fessiers');
  var is_=tc('Ischio-jambiers'),ois=op('Ischio-jambiers'),mo=tc('Mollets'),omo=op('Mollets');
  return '<svg viewBox="0 0 200 480" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'
  +'<defs><radialGradient id="bbody" cx="50%" cy="30%" r="55%"><stop offset="0%" stop-color="#3a1a0a"/><stop offset="100%" stop-color="#1a0808"/></radialGradient></defs>'
  +'<path d="M100,4 C118,4 128,14 128,28 C128,40 122,48 112,52 L118,66 C134,66 152,74 160,88 C167,100 164,116 160,126 L155,195 L157,224 C159,234 161,244 158,254 L152,330 L155,365 L148,415 L140,420 L134,480 L66,480 L60,420 L52,415 L45,365 L48,330 L42,254 C39,244 41,234 43,224 L45,195 L40,126 C36,116 33,100 40,88 C48,74 66,66 82,66 L88,52 C78,48 72,40 72,28 C72,14 82,4 100,4 Z" fill="url(#bbody)" stroke="#2a0808" stroke-width="0.8"/>'
  +'<path d="M88,52 Q100,46 112,52 L120,68 Q100,78 80,68 Z" fill="'+tr+'" fill-opacity="'+otr+'"/>'
  +'<path d="M56,90 Q78,98 100,100 Q122,98 144,90 L136,120 Q100,130 64,120 Z" fill="'+tr+'" fill-opacity="'+otr+'"/>'
  +'<line x1="56" y1="92" x2="144" y2="92" stroke="#1a0808" stroke-width="0.8" stroke-opacity="0.3"/>'
  +'<path d="M40,88 C34,98 32,112 35,126 C38,136 48,144 58,142 C66,140 72,130 72,116 C72,102 66,90 58,84 C52,80 44,82 40,88 Z" fill="'+ep+'" fill-opacity="'+oep+'"/>'
  +'<path d="M160,88 C166,98 168,112 165,126 C162,136 152,144 142,142 C134,140 128,130 128,116 C128,102 134,90 142,84 C148,80 156,82 160,88 Z" fill="'+ep+'" fill-opacity="'+oep+'"/>'
  +'<path d="M34,106 C26,122 24,144 27,166 C30,180 40,192 52,190 C62,188 70,178 70,164 C70,146 63,122 52,108 Z" fill="'+tri+'" fill-opacity="'+otri+'"/>'
  +'<path d="M166,106 C174,122 176,144 173,166 C170,180 160,192 148,190 C138,188 130,178 130,164 C130,146 137,122 148,108 Z" fill="'+tri+'" fill-opacity="'+otri+'"/>'
  +'<path d="M40,116 C30,138 28,165 32,194 C36,212 48,224 64,226 C74,226 82,218 84,206 C86,190 80,165 70,144 Z" fill="'+do_+'" fill-opacity="'+odo+'"/>'
  +'<path d="M160,116 C170,138 172,165 168,194 C164,212 152,224 136,226 C126,226 118,218 116,206 C114,190 120,165 130,144 Z" fill="'+do_+'" fill-opacity="'+odo+'"/>'
  +'<path d="M76,130 C72,155 72,182 74,206 L86,210 L88,136 Z" fill="'+lo+'" fill-opacity="'+olo+'"/>'
  +'<path d="M124,130 C128,155 128,182 126,206 L114,210 L112,136 Z" fill="'+lo+'" fill-opacity="'+olo+'"/>'
  +'<line x1="100" y1="128" x2="100" y2="250" stroke="#1a0808" stroke-width="1.5" stroke-opacity="0.55"/>'
  +'<path d="M44,252 C34,272 33,296 38,316 C43,332 58,342 74,340 C86,338 94,328 96,314 C98,296 90,270 76,256 Z" fill="'+fe+'" fill-opacity="'+ofe+'"/>'
  +'<path d="M156,252 C166,272 167,296 162,316 C157,332 142,342 126,340 C114,338 106,328 104,314 C102,296 110,270 124,256 Z" fill="'+fe+'" fill-opacity="'+ofe+'"/>'
  +'<path d="M96,260 C98,284 100,308 100,326" stroke="#1a0808" stroke-width="1.5" stroke-opacity="0.4" fill="none"/>'
  +'<path d="M104,260 C102,284 100,308 100,326" stroke="#1a0808" stroke-width="1.5" stroke-opacity="0.4" fill="none"/>'
  +'<path d="M44,340 C36,364 35,390 38,414 C41,432 54,444 68,442 C80,440 88,428 88,412 C88,390 80,362 66,344 Z" fill="'+is_+'" fill-opacity="'+ois+'"/>'
  +'<path d="M88,342 C84,364 82,388 85,412 C88,428 98,440 110,440 C120,438 126,426 126,410 C126,390 120,364 112,344 Z" fill="'+is_+'" fill-opacity="'+ois+'"/>'
  +'<path d="M156,340 C164,364 165,390 162,414 C159,432 146,444 132,442 C120,440 112,428 112,412 C112,390 120,362 134,344 Z" fill="'+is_+'" fill-opacity="'+ois+'"/>'
  +'<path d="M36,448 C29,468 29,488 33,504 C37,516 48,524 60,520 C70,516 76,506 76,490 C76,472 68,452 56,440 Z" fill="'+mo+'" fill-opacity="'+omo+'"/>'
  +'<path d="M76,450 C83,468 84,488 81,506 C78,518 68,526 58,524 C64,512 68,494 68,474 C68,462 72,452 76,450 Z" fill="'+mo+'" fill-opacity="'+omo+'"/>'
  +'<path d="M164,448 C171,468 171,488 167,504 C163,516 152,524 140,520 C130,516 124,506 124,490 C124,472 132,452 144,440 Z" fill="'+mo+'" fill-opacity="'+omo+'"/>'
  +'<path d="M124,450 C117,468 116,488 119,506 C122,518 132,526 142,524 C136,512 132,494 132,474 C132,462 128,452 124,450 Z" fill="'+mo+'" fill-opacity="'+omo+'"/>'
  +'<line x1="60" y1="444" x2="60" y2="520" stroke="#1a0808" stroke-width="1" stroke-opacity="0.3"/>'
  +'<line x1="140" y1="444" x2="140" y2="520" stroke="#1a0808" stroke-width="1" stroke-opacity="0.3"/>'
  +'<ellipse cx="100" cy="22" rx="20" ry="22" fill="#5a3018" stroke="#3a1a08" stroke-width="0.8"/>'
  +'<path d="M88,43 C86,48 86,56 88,60 L100,62 L112,60 C114,56 114,48 112,43 C108,40 92,40 88,43 Z" fill="#5a3018" stroke="#3a1a08" stroke-width="0.5"/>'
  +'<ellipse cx="62" cy="443" rx="16" ry="10" fill="#3a1a08" stroke="#2a1008" stroke-width="0.7"/>'
  +'<ellipse cx="138" cy="443" rx="16" ry="10" fill="#3a1a08" stroke="#2a1008" stroke-width="0.7"/>'
  +'</svg>';
}  svg = svg.replace(/OPAC_TRI_T/g, opt('Triceps'));
  svg = svg.replace(/COND_TRI/g, cond('Triceps','bg-tri-g'));
  svg = svg.replace(/STROKE_TRI/g, 'stroke="' + tc('Triceps') + '" stroke-width="0.4" stroke-opacity="' + opd('Triceps') + '"');

  // DORSAL
  svg = svg.replace(/FILL_DO/g, tc('Dorsal'));
  svg = svg.replace(/OPAC_DO_HL/g, oph('Dorsal'));
  svg = svg.replace(/OPAC_DO_F/g, opf('Dorsal'));
  svg = svg.replace(/COND_DO/g, cond('Dorsal','bg-do-g'));
  svg = svg.replace(/STROKE_DO/g, 'stroke="' + tc('Dorsal') + '" stroke-width="0.4" stroke-opacity="' + opd('Dorsal') + '"');

  // LOMBAIRES
  svg = svg.replace(/FILL_LO/g, tc('Lombaires'));
  svg = svg.replace(/OPAC_LO_HL/g, oph('Lombaires'));
  svg = svg.replace(/OPAC_LO_D/g, opd('Lombaires'));
  svg = svg.replace(/OPAC_LO_F/g, opf('Lombaires'));
  svg = svg.replace(/COND_LO/g, cond('Lombaires','bg-lo-g'));
  svg = svg.replace(/STROKE_LO/g, 'stroke="' + tc('Lombaires') + '" stroke-width="0.4" stroke-opacity="' + opd('Lombaires') + '"');

  // FESSIERS
  svg = svg.replace(/FILL_FE/g, tc('Fessiers'));
  svg = svg.replace(/OPAC_FE_M/g, ops('Fessiers'));
  svg = svg.replace(/OPAC_FE_HL/g, oph('Fessiers'));
  svg = svg.replace(/OPAC_FE_F/g, opf('Fessiers'));
  svg = svg.replace(/COND_FE/g, cond('Fessiers','bg-fe-g'));
  svg = svg.replace(/STROKE_FE/g, 'stroke="' + tc('Fessiers') + '" stroke-width="0.4" stroke-opacity="' + opd('Fessiers') + '"');

  // ISCHIO-JAMBIERS
  svg = svg.replace(/FILL_IS/g, tc('Ischio-jambiers'));
  svg = svg.replace(/OPAC_IS_HL/g, oph('Ischio-jambiers'));
  svg = svg.replace(/OPAC_IS_D/g, opd('Ischio-jambiers'));
  svg = svg.replace(/OPAC_IS_F/g, opf('Ischio-jambiers'));
  svg = svg.replace(/COND_IS/g, cond('Ischio-jambiers','bg-is-g'));
  svg = svg.replace(/STROKE_IS/g, 'stroke="' + tc('Ischio-jambiers') + '" stroke-width="0.4" stroke-opacity="' + opd('Ischio-jambiers') + '"');

  // MOLLETS
  svg = svg.replace(/FILL_MO/g, tc('Mollets'));
  svg = svg.replace(/OPAC_MO_HL/g, oph('Mollets'));
  svg = svg.replace(/OPAC_MO_S/g, ops('Mollets'));
  svg = svg.replace(/OPAC_MO_F/g, opf('Mollets'));
  svg = svg.replace(/COND_MO/g, cond('Mollets','bg-mo-g'));
  svg = svg.replace(/STROKE_MO/g, 'stroke="' + tc('Mollets') + '" stroke-width="0.4" stroke-opacity="' + opd('Mollets') + '"');

  return svg;
}
