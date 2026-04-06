/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/front.js
   Vue de face via body-highlighter CDN + fallback SVG
══════════════════════════════════════════════════════════════════════════ */

var FRONT_MUSCLE_MAP = {
  'Pectoraux':    ['chest'],
  'Épaules':      ['front-deltoids'],
  'Biceps':       ['biceps'],
  'Abdominaux':   ['abs', 'obliques'],
  'Quadriceps':   ['quads'],
  'Mollets':      ['calves', 'tibialis'],
  'Trapèzes':     ['trapezius'],
};

function buildBodyFront() {
  if (!window.BODY_HIGHLIGHTER_FAILED && _bodyHighlighterAvailable()) {
    return _buildHighlighterSVG('anterior', FRONT_MUSCLE_MAP);
  }
  return _fallbackFront();
}

function _bodyHighlighterAvailable() {
  return typeof BodyHighlighter !== 'undefined'
      || (typeof bodyHighlighter !== 'undefined' && typeof bodyHighlighter === 'function')
      || (typeof window.bodyHighlighter !== 'undefined');
}

function _buildHighlighterSVG(side, muscleMap) {
  var data = [];
  Object.keys(muscleMap).forEach(function(grp) {
    var n = seriesCountByGroup(grp);
    if (n === 0) return;
    var ti  = getTier(n);
    var pct = getTierProgress(n);
    muscleMap[grp].forEach(function(slug) {
      data.push({ slug: slug, color: ti.col, intensity: Math.min(1, 0.35 + pct * 0.65) });
    });
  });

  var wrap = document.createElement('div');
  try {
    var Lib = typeof BodyHighlighter !== 'undefined' ? BodyHighlighter : window.bodyHighlighter;
    if (typeof Lib === 'function') {
      new Lib({ target: wrap, side: side, data: data });
      if (wrap.innerHTML) return wrap.innerHTML;
    }
  } catch(e) { console.warn('[body-highlighter]', e); }
  return side === 'anterior' ? _fallbackFront() : _fallbackBack();
}

function _fallbackFront() {
  function tc(m){ var n=seriesCountByGroup(m); return n>0?getTier(n).col:'none'; }
  function op(m){ var n=seriesCountByGroup(m); return n>0?'0.58':'0'; }
  var pc=tc('Pectoraux'),opc=op('Pectoraux'),ep=tc('Épaules'),oep=op('Épaules');
  var bi=tc('Biceps'),obi=op('Biceps'),ab=tc('Abdominaux'),oab=op('Abdominaux');
  var qu=tc('Quadriceps'),oqu=op('Quadriceps'),mo=tc('Mollets'),omo=op('Mollets');
  var tr=tc('Trapèzes'),otr=op('Trapèzes');
  return '<svg viewBox="0 0 200 480" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'
  +'<defs><radialGradient id="fbody" cx="50%" cy="30%" r="55%"><stop offset="0%" stop-color="#3a1a0a"/><stop offset="100%" stop-color="#1a0808"/></radialGradient></defs>'
  +'<path d="M100,4 C118,4 128,14 128,28 C128,40 122,48 112,52 L118,66 C134,66 152,74 160,88 C167,100 164,116 160,126 L155,195 L157,224 C159,234 161,244 158,254 L152,330 L155,365 L148,415 L140,420 L134,480 L66,480 L60,420 L52,415 L45,365 L48,330 L42,254 C39,244 41,234 43,224 L45,195 L40,126 C36,116 33,100 40,88 C48,74 66,66 82,66 L88,52 C78,48 72,40 72,28 C72,14 82,4 100,4 Z" fill="url(#fbody)" stroke="#2a0808" stroke-width="0.8"/>'
  +'<path d="M82,54 Q100,48 118,54 L124,72 Q100,80 76,72 Z" fill="'+tr+'" fill-opacity="'+otr+'"/>'
  +'<path d="M40,88 C34,98 32,112 35,126 C38,136 48,144 58,142 C66,140 72,130 72,116 C72,102 66,90 58,84 C52,80 44,82 40,88 Z" fill="'+ep+'" fill-opacity="'+oep+'"/>'
  +'<path d="M160,88 C166,98 168,112 165,126 C162,136 152,144 142,142 C134,140 128,130 128,116 C128,102 134,90 142,84 C148,80 156,82 160,88 Z" fill="'+ep+'" fill-opacity="'+oep+'"/>'
  +'<path d="M82,66 C72,72 55,84 42,100 C36,110 38,130 46,142 C54,152 70,158 84,156 C96,154 108,144 110,130 C112,114 104,96 94,86 Z" fill="'+pc+'" fill-opacity="'+opc+'"/>'
  +'<path d="M118,66 C128,72 145,84 158,100 C164,110 162,130 154,142 C146,152 130,158 116,156 C104,154 92,144 90,130 C88,114 96,96 106,86 Z" fill="'+pc+'" fill-opacity="'+opc+'"/>'
  +'<line x1="100" y1="66" x2="100" y2="156" stroke="#1a0808" stroke-width="1.5" stroke-opacity="0.5"/>'
  +'<path d="M34,104 C26,118 24,138 26,158 C28,172 38,184 50,184 C60,182 68,172 68,158 C68,140 62,118 52,106 C46,100 37,98 34,104 Z" fill="'+bi+'" fill-opacity="'+obi+'"/>'
  +'<path d="M166,104 C174,118 176,138 174,158 C172,172 162,184 150,184 C140,182 132,172 132,158 C132,140 138,118 148,106 C154,100 163,98 166,104 Z" fill="'+bi+'" fill-opacity="'+obi+'"/>'
  +'<rect x="78" y="158" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="104" y="158" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="77" y="178" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="105" y="178" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="77" y="198" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="105" y="198" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<line x1="100" y1="155" x2="100" y2="220" stroke="#1a0808" stroke-width="1.5" stroke-opacity="0.55"/>'
  +'<line x1="74" y1="176" x2="126" y2="176" stroke="#1a0808" stroke-width="0.8" stroke-opacity="0.35"/>'
  +'<line x1="74" y1="196" x2="126" y2="196" stroke="#1a0808" stroke-width="0.8" stroke-opacity="0.35"/>'
  +'<path d="M45,264 C37,285 35,312 38,340 C41,362 52,378 66,380 C76,380 84,372 86,360 C88,344 82,316 72,295 Z" fill="'+qu+'" fill-opacity="'+oqu+'"/>'
  +'<path d="M86,260 C80,276 78,298 80,322 C82,344 90,364 100,372 C108,376 116,374 120,364 C126,350 124,324 116,300 Z" fill="'+qu+'" fill-opacity="'+oqu+'"/>'
  +'<path d="M120,310 C116,326 116,346 120,362 C124,376 134,386 144,384 C150,380 152,370 150,356 C148,340 140,322 130,312 Z" fill="'+qu+'" fill-opacity="'+oqu+'"/>'
  +'<path d="M155,264 C163,285 165,312 162,340 C159,362 148,378 134,380 C124,380 116,372 114,360 C112,344 118,316 128,295 Z" fill="'+qu+'" fill-opacity="'+oqu+'"/>'
  +'<path d="M38,388 C31,408 30,430 33,450 C36,464 46,474 58,472 C68,470 74,460 74,446 C74,428 67,406 56,390 Z" fill="'+mo+'" fill-opacity="'+omo+'"/>'
  +'<path d="M162,388 C169,408 170,430 167,450 C164,464 154,474 142,472 C132,470 126,460 126,446 C126,428 133,406 144,390 Z" fill="'+mo+'" fill-opacity="'+omo+'"/>'
  +'<ellipse cx="100" cy="22" rx="20" ry="22" fill="#5a3018" stroke="#3a1a08" stroke-width="0.8"/>'
  +'<path d="M88,43 C86,48 86,56 88,60 L100,62 L112,60 C114,56 114,48 112,43 C108,40 92,40 88,43 Z" fill="#5a3018" stroke="#3a1a08" stroke-width="0.5"/>'
  +'<ellipse cx="62" cy="383" rx="16" ry="10" fill="#3a1a08" stroke="#2a1008" stroke-width="0.7"/>'
  +'<ellipse cx="138" cy="383" rx="16" ry="10" fill="#3a1a08" stroke="#2a1008" stroke-width="0.7"/>'
  +'</svg>';
}    muscleMap[grp].forEach(function(slug) {
      data.push({ slug: slug, color: ti.col, intensity: Math.min(1, 0.35 + pct * 0.65) });
    });
  });

  var wrap = document.createElement('div');
  try {
    var Lib = typeof BodyHighlighter !== 'undefined' ? BodyHighlighter : window.bodyHighlighter;
    if (typeof Lib === 'function') {
      new Lib({ target: wrap, side: side, data: data });
      if (wrap.innerHTML) return wrap.innerHTML;
    }
  } catch(e) { console.warn('[body-highlighter]', e); }
  return side === 'anterior' ? _fallbackFront() : _fallbackBack();
}

function _fallbackFront() {
  function tc(m){ var n=seriesCountByGroup(m); return n>0?getTier(n).col:'none'; }
  function op(m){ var n=seriesCountByGroup(m); return n>0?'0.58':'0'; }
  var pc=tc('Pectoraux'),opc=op('Pectoraux'),ep=tc('Épaules'),oep=op('Épaules');
  var bi=tc('Biceps'),obi=op('Biceps'),ab=tc('Abdominaux'),oab=op('Abdominaux');
  var qu=tc('Quadriceps'),oqu=op('Quadriceps'),mo=tc('Mollets'),omo=op('Mollets');
  var tr=tc('Trapèzes'),otr=op('Trapèzes');
  return '<svg viewBox="0 0 200 480" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'
  +'<defs><radialGradient id="fbody" cx="50%" cy="30%" r="55%"><stop offset="0%" stop-color="#3a1a0a"/><stop offset="100%" stop-color="#1a0808"/></radialGradient></defs>'
  +'<path d="M100,4 C118,4 128,14 128,28 C128,40 122,48 112,52 L118,66 C134,66 152,74 160,88 C167,100 164,116 160,126 L155,195 L157,224 C159,234 161,244 158,254 L152,330 L155,365 L148,415 L140,420 L134,480 L66,480 L60,420 L52,415 L45,365 L48,330 L42,254 C39,244 41,234 43,224 L45,195 L40,126 C36,116 33,100 40,88 C48,74 66,66 82,66 L88,52 C78,48 72,40 72,28 C72,14 82,4 100,4 Z" fill="url(#fbody)" stroke="#2a0808" stroke-width="0.8"/>'
  // Trapèzes
  +'<path d="M82,54 Q100,48 118,54 L124,72 Q100,80 76,72 Z" fill="'+tr+'" fill-opacity="'+otr+'"/>'
  // Épaules
  +'<path d="M40,88 C34,98 32,112 35,126 C38,136 48,144 58,142 C66,140 72,130 72,116 C72,102 66,90 58,84 C52,80 44,82 40,88 Z" fill="'+ep+'" fill-opacity="'+oep+'"/>'
  +'<path d="M160,88 C166,98 168,112 165,126 C162,136 152,144 142,142 C134,140 128,130 128,116 C128,102 134,90 142,84 C148,80 156,82 160,88 Z" fill="'+ep+'" fill-opacity="'+oep+'"/>'
  // Pectoraux
  +'<path d="M82,66 C72,72 55,84 42,100 C36,110 38,130 46,142 C54,152 70,158 84,156 C96,154 108,144 110,130 C112,114 104,96 94,86 Z" fill="'+pc+'" fill-opacity="'+opc+'"/>'
  +'<path d="M118,66 C128,72 145,84 158,100 C164,110 162,130 154,142 C146,152 130,158 116,156 C104,154 92,144 90,130 C88,114 96,96 106,86 Z" fill="'+pc+'" fill-opacity="'+opc+'"/>'
  +'<line x1="100" y1="66" x2="100" y2="156" stroke="#1a0808" stroke-width="1.5" stroke-opacity="0.5"/>'
  // Biceps
  +'<path d="M34,104 C26,118 24,138 26,158 C28,172 38,184 50,184 C60,182 68,172 68,158 C68,140 62,118 52,106 C46,100 37,98 34,104 Z" fill="'+bi+'" fill-opacity="'+obi+'"/>'
  +'<path d="M166,104 C174,118 176,138 174,158 C172,172 162,184 150,184 C140,182 132,172 132,158 C132,140 138,118 148,106 C154,100 163,98 166,104 Z" fill="'+bi+'" fill-opacity="'+obi+'"/>'
  // Abdos 6 segments
  +'<rect x="78" y="158" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="104" y="158" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="77" y="178" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="105" y="178" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="77" y="198" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<rect x="105" y="198" width="18" height="16" rx="4" fill="'+ab+'" fill-opacity="'+oab+'"/>'
  +'<line x1="100" y1="155" x2="100" y2="220" stroke="#1a0808" stroke-width="1.5" stroke-opacity="0.55"/>'
  +'<line x1="74" y1="176" x2="126" y2="176" stroke="#1a0808" stroke-width="0.8" stroke-opacity="0.35"/>'
  +'<line x1="74" y1="196" x2="126" y2="196" stroke="#1a0808" stroke-width="0.8" stroke-opacity="0.35"/>'
  // Quadriceps
  +'<path d="M45,264 C37,285 35,312 38,340 C41,362 52,378 66,380 C76,380 84,372 86,360 C88,344 82,316 72,295 Z" fill="'+qu+'" fill-opacity="'+oqu+'"/>'
  +'<path d="M86,260 C80,276 78,298 80,322 C82,344 90,364 100,372 C108,376 116,374 120,364 C126,350 124,324 116,300 Z" fill="'+qu+'" fill-opacity="'+oqu+'"/>'
  +'<path d="M120,310 C116,326 116,346 120,362 C124,376 134,386 144,384 C150,380 152,370 150,356 C148,340 140,322 130,312 Z" fill="'+qu+'" fill-opacity="'+oqu+'"/>'
  +'<path d="M155,264 C163,285 165,312 162,340 C159,362 148,378 134,380 C124,380 116,372 114,360 C112,344 118,316 128,295 Z" fill="'+qu+'" fill-opacity="'+oqu+'"/>'
  // Mollets
  +'<path d="M38,388 C31,408 30,430 33,450 C36,464 46,474 58,472 C68,470 74,460 74,446 C74,428 67,406 56,390 Z" fill="'+mo+'" fill-opacity="'+omo+'"/>'
  +'<path d="M162,388 C169,408 170,430 167,450 C164,464 154,474 142,472 C132,470 126,460 126,446 C126,428 133,406 144,390 Z" fill="'+mo+'" fill-opacity="'+omo+'"/>'
  // Tête + cou + genoux
  +'<ellipse cx="100" cy="22" rx="20" ry="22" fill="#5a3018" stroke="#3a1a08" stroke-width="0.8"/>'
  +'<path d="M88,43 C86,48 86,56 88,60 L100,62 L112,60 C114,56 114,48 112,43 C108,40 92,40 88,43 Z" fill="#5a3018" stroke="#3a1a08" stroke-width="0.5"/>'
  +'<ellipse cx="62" cy="383" rx="16" ry="10" fill="#3a1a08" stroke="#2a1008" stroke-width="0.7"/>'
  +'<ellipse cx="138" cy="383" rx="16" ry="10" fill="#3a1a08" stroke="#2a1008" stroke-width="0.7"/>'
  +'</svg>';
}  svg = svg.replace(/FILL_BI/g, tc('Biceps'));
  svg = svg.replace(/OPAC_BI_HL/g, oph('Biceps'));
  svg = svg.replace(/OPAC_BI_D/g, opd('Biceps'));
  svg = svg.replace(/OPAC_BI_FA/g, ops('Biceps'));
  svg = svg.replace(/OPAC_BI_F/g, opf('Biceps'));
  svg = svg.replace(/OPAC_BI/g, op('Biceps'));
  svg = svg.replace(/COND_BI/g, cond('Biceps','ag-bi'));
  svg = svg.replace(/STROKE_BI/g, 'stroke="' + tc('Biceps') + '" stroke-width="0.4" stroke-opacity="' + opd('Biceps') + '"');

  // ABDOMINAUX
  svg = svg.replace(/FILL_AB/g, tc('Abdominaux'));
  svg = svg.replace(/OPAC_AB_HL/g, oph('Abdominaux'));
  svg = svg.replace(/COND_AB/g, cond('Abdominaux','ag-ab'));
  svg = svg.replace(/STROKE_AB/g, 'stroke="' + tc('Abdominaux') + '" stroke-width="0.5" stroke-opacity="' + opd('Abdominaux') + '"');

  // OBLIQUES (groupe Abdominaux)
  svg = svg.replace(/FILL_FA/g, tc('Abdominaux'));
  svg = svg.replace(/OPAC_FA_F/g, opf('Abdominaux'));
  svg = svg.replace(/OPAC_FA_S/g, ops('Abdominaux'));
  svg = svg.replace(/OPAC_FA/g, op('Abdominaux'));
  svg = svg.replace(/COND_FA/g, cond('Abdominaux','ag-fa'));
  svg = svg.replace(/STROKE_FA/g, 'stroke="' + tc('Abdominaux') + '" stroke-width="0.3" stroke-opacity="' + opd('Abdominaux') + '"');

  // QUADRICEPS
  svg = svg.replace(/FILL_QU/g, tc('Quadriceps'));
  svg = svg.replace(/OPAC_QU_HL/g, oph('Quadriceps'));
  svg = svg.replace(/OPAC_QU_IT/g, opit('Quadriceps'));
  svg = svg.replace(/OPAC_QU_F/g, opf('Quadriceps'));
  svg = svg.replace(/COND_QU/g, cond('Quadriceps','ag-qu'));
  svg = svg.replace(/STROKE_QU/g, 'stroke="' + tc('Quadriceps') + '" stroke-width="0.4" stroke-opacity="' + opd('Quadriceps') + '"');

  // MOLLETS
  svg = svg.replace(/FILL_MO/g, tc('Mollets'));
  svg = svg.replace(/OPAC_MO_HL/g, oph('Mollets'));
  svg = svg.replace(/OPAC_MO_G/g, ops('Mollets'));
  svg = svg.replace(/OPAC_MO_F/g, opf('Mollets'));
  svg = svg.replace(/OPAC_MO/g, op('Mollets'));
  svg = svg.replace(/COND_MO/g, cond('Mollets','ag-mo'));
  svg = svg.replace(/STROKE_MO/g, 'stroke="' + tc('Mollets') + '" stroke-width="0.4" stroke-opacity="' + opd('Mollets') + '"');

  return svg;
}
