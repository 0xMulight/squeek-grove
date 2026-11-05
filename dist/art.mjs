export function icon(name,size=20){
 const paths={
  sprout:'<path d="M12 21v-9M12 16C3 16 3 9 3 9s9-1 9 7Zm0-4c0-9 9-9 9-9s1 9-9 9Z"/>',
  garden:'<path d="M3 12h18v9H3zM2 12l10-9 10 9M8 21v-5h8v5M12 4v7M8 8h8"/>',
  book:'<path d="M12 5v16M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Z"/>',
  star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
  water:'<path d="M12 2S5 11 5 15a7 7 0 0 0 14 0c0-4-7-13-7-13Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  seed:'<path d="M5 19C-1 10 9 2 20 3c1 11-7 21-15 16ZM5 19 16 7"/>',
  bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-8Z"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  share:'<path d="M12 16V3m-5 5 5-5 5 5M5 12v8h14v-8"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 1 1 4 3c-1 .5-1 1-1 2m0 3v.2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  download:'<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  reset:'<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
  leaf:'<path d="M4 19C0 6 13 3 21 3c0 8-3 20-17 16Zm0 0L16 8"/>',
  external:'<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',
  wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7m0 4v7M3 12h7m4 0h7m-8 1 5 5m-7-7L6 6m7 5 5-5m-7 7-5 5"/>'
 };
 return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.sprout}</svg>`;
}
export function hamster(className=''){
 return `<svg class="${className}" viewBox="0 0 160 150" fill="none" aria-hidden="true"><ellipse cx="80" cy="135" rx="52" ry="7" fill="#496e4e" opacity=".12"/><circle cx="47" cy="43" r="21" fill="#d6a46e"/><circle cx="115" cy="43" r="21" fill="#d6a46e"/><circle cx="47" cy="43" r="12" fill="#edc1a6"/><circle cx="115" cy="43" r="12" fill="#edc1a6"/><path d="M29 93c-2-43 22-59 51-59 32 0 54 25 52 59-1 28-20 43-53 43-33 0-49-14-50-43Z" fill="#e5bd87"/><path d="M44 85c3-12 14-12 21-5 10 9 21 9 31 0 11-9 24-4 25 12 2 22-11 36-40 36-27 0-43-16-37-43Z" fill="#fff1d6"/><ellipse cx="57" cy="76" rx="4" ry="5" fill="#3c4534"/><ellipse cx="104" cy="76" rx="4" ry="5" fill="#3c4534"/><circle cx="58" cy="74" r="1.3" fill="white"/><circle cx="105" cy="74" r="1.3" fill="white"/><ellipse cx="47" cy="90" rx="10" ry="6" fill="#e8ad91"/><ellipse cx="114" cy="90" rx="10" ry="6" fill="#e8ad91"/><path d="m76 87 5 4 5-4" fill="#b9876c"/><path d="M81 92c-5 7-11 0-11 0m11 0c5 7 11 0 11 0" stroke="#7c6d51" stroke-width="2" stroke-linecap="round"/><ellipse cx="54" cy="128" rx="13" ry="6" fill="#bc8c5d"/><ellipse cx="107" cy="128" rx="13" ry="6" fill="#bc8c5d"/><path d="M70 116c0-11 10-17 20-14-2 14-12 18-20 14Z" fill="#778b49"/><path d="m69 117 15-10" stroke="#fff1d6" stroke-width="2"/><ellipse cx="62" cy="110" rx="11" ry="6" transform="rotate(25 62 110)" fill="#d6a46e"/><ellipse cx="98" cy="109" rx="11" ry="6" transform="rotate(-25 98 109)" fill="#d6a46e"/></svg>`;
}
export function plantArt(id,progress=1,size=100){
 const stage=progress<.25?0:progress<.65?1:2;
 let a='';
 if(stage===0){a='<path d="M50 86V62" stroke="#5c8451" stroke-width="4"/><path d="M50 73c-18-1-18-16-18-16s18-1 18 16Z" fill="#81a66a"/><path d="M50 67c0-17 17-19 17-19s2 18-17 19Z" fill="#5d8c57"/>';}
 else if(id==='carrot'){
  a=`<path d="M${stage===1?'39 72c-2 10 7 18 12 22 9-10 15-19 12-26':'34 57c-4 15 6 32 17 40 11-14 21-31 16-45'}Z" fill="#e58a50"/><path d="m41 65 12 4m-8 11 10 3" stroke="#c77240" stroke-width="2.5" stroke-linecap="round"/><path d="M50 58C31 45 27 29 28 24c20 7 26 15 22 34Z" fill="#659450"/><path d="M52 58C44 32 49 16 57 9c13 20 6 32-5 49Z" fill="#81aa5c"/><path d="M55 59C55 38 71 28 80 28c-2 19-10 27-25 31Z" fill="#4e7e4b"/>`;
 }else if(id==='daisy'){
  a='<path d="M50 91V41m0 38L31 61m19 7 18-16" stroke="#63935d" stroke-width="4"/><path d="M48 77C30 81 24 63 24 63s16-4 24 14Zm5-9c-1-15 19-17 19-17s3 14-19 17Z" fill="#87aa67"/>';
  if(stage===1)a+='<ellipse cx="50" cy="39" rx="11" ry="15" fill="#e6d7a5"/><path d="M39 43q11 13 22 0" fill="#8aa967"/>';
  else a+='<g fill="#fffbee" stroke="#e5d9ba" stroke-width=".7"><ellipse cx="50" cy="25" rx="8" ry="15"/><ellipse cx="50" cy="55" rx="8" ry="15"/><ellipse cx="35" cy="40" rx="15" ry="8"/><ellipse cx="65" cy="40" rx="15" ry="8"/><ellipse cx="39" cy="29" rx="7" ry="14" transform="rotate(-45 39 29)"/><ellipse cx="61" cy="51" rx="7" ry="14" transform="rotate(-45 61 51)"/><ellipse cx="39" cy="51" rx="14" ry="7" transform="rotate(-45 39 51)"/><ellipse cx="61" cy="29" rx="14" ry="7" transform="rotate(-45 61 29)"/></g><circle cx="50" cy="40" r="11" fill="#e6bc59"/><circle cx="47" cy="36" r="2" fill="#f5d77c"/>';
 }else if(id==='berry'){
  a='<path d="M50 92V43M50 71 28 49m22 10 23-25" stroke="#627b50" stroke-width="4"/><path d="M46 74C24 80 17 66 18 63c16-8 23-2 28 11Zm7-11c0-20 21-20 26-17-1 15-12 21-26 17Z" fill="#6b925e"/><path d="M46 51C26 53 27 32 27 32s19-1 19 19Zm6 1c-5-22 9-30 14-29 6 16 0 23-14 29Z" fill="#91ad71"/>';
  if(stage===2)a+='<g fill="#777ca9" stroke="#565f89" stroke-width="1.5"><circle cx="28" cy="63" r="10"/><circle cx="48" cy="58" r="10"/><circle cx="64" cy="72" r="11"/><circle cx="70" cy="48" r="9"/></g><g stroke="#afb4d5" stroke-width="2.3" stroke-linecap="round"><path d="m25 59 3 2 3-2m14-5 3 2 3-2m10 12 3 2 3-2m3-24 3 2 3-2"/></g>';
  else a+='<circle cx="35" cy="54" r="6" fill="#c1b5c9"/><circle cx="65" cy="62" r="6" fill="#c1b5c9"/>';
 }else{
  a='<path d="M50 95V42" stroke="#648c48" stroke-width="5"/><path d="M48 83C21 85 24 62 24 62s23-1 24 21Zm5-9c0-23 24-25 24-25s3 23-24 25Z" fill="#84a452"/>';
  if(stage===2){for(let i=0;i<12;i++)a+=`<ellipse cx="50" cy="19" rx="7" ry="14" transform="rotate(${i*30} 50 37)" fill="${i%2?'#efbf48':'#e3aa3a'}"/>`;a+='<circle cx="50" cy="37" r="16" fill="#8a6743"/><circle cx="50" cy="37" r="11" fill="#a17d4d"/><path d="M44 32h2m6 0h2m-13 7h2m6 0h2m-7 6h2m6-1h2" stroke="#d3ad6a" stroke-width="2" stroke-linecap="round"/>';}
  else a+='<ellipse cx="50" cy="37" rx="13" ry="17" fill="#a7b35f"/><path d="M41 34q8-16 18 0" stroke="#d6c969" stroke-width="4"/>';
 }
 return `<svg width="${size}" height="${size}" viewBox="0 0 100 105" aria-hidden="true"><ellipse cx="50" cy="94" rx="26" ry="6" fill="#344a2f" opacity=".13"/>${a}</svg>`;
}
export function gardenScenery(){
 return `<svg class="scenery" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#e7eed6"/><stop offset="1" stop-color="#dce7c7"/></linearGradient><linearGradient id="lawn" x2="0" y2="1"><stop stop-color="#c6d5a0"/><stop offset="1" stop-color="#b3c68d"/></linearGradient><pattern id="grass" width="64" height="65" patternUnits="userSpaceOnUse"><path d="m14 30-2-5m2 5 3-4m28 28-1-4m1 4 2-3" stroke="#799b65" opacity=".3" stroke-width="1.8" stroke-linecap="round"/></pattern></defs><rect width="800" height="550" fill="url(#sky)"/><circle cx="665" cy="78" r="38" fill="#faf4cc"/><circle cx="665" cy="78" r="53" fill="#faf4cc" opacity=".2"/><path d="M0 112Q130 23 270 125T600 115T800 80V350H0Z" fill="#c4d6b4"/><path d="M0 168Q100 96 242 172T536 136T800 157V550H0Z" fill="url(#lawn)"/><path d="M0 205Q195 192 340 208T800 220" stroke="#a5bc8d" stroke-width="5" fill="none"/><path d="M500 550Q610 430 545 353T420 228" stroke="#dce0b8" stroke-width="72" fill="none"/><path d="M500 550Q610 430 545 353T420 228" stroke="#e6e7c5" stroke-width="55" fill="none"/><rect width="800" height="550" fill="url(#grass)"/><g fill="#ecebd4" stroke="#b7bda0" stroke-width="1.3"><path d="M21 205v-49l7-9 7 9v49m32 0v-49l7-9 7 9v49m32 0v-49l7-9 7 9v49m32 0v-49l7-9 7 9v49"/><path d="M8 166h170v8H8m0 17h170v8H8"/></g><g><path d="M705 206v-91" stroke="#9e9471" stroke-width="14"/><path d="m706 158-26-35m27 45 24-27" stroke="#9e9471" stroke-width="7"/><ellipse cx="702" cy="105" rx="54" ry="52" fill="#83a779"/><circle cx="675" cy="109" r="33" fill="#90b080"/><circle cx="723" cy="91" r="35" fill="#9bb787"/><circle cx="710" cy="65" r="25" fill="#a7c08f"/><circle cx="686" cy="92" r="4" fill="#e0bf74"/><circle cx="729" cy="111" r="4" fill="#e0bf74"/><circle cx="713" cy="74" r="4" fill="#e0bf74"/></g><g transform="translate(48 373)"><ellipse cx="34" cy="78" rx="42" ry="9" fill="#77925d" opacity=".18"/><path d="M3 35h64L57 79H14Z" fill="#b98d68"/><path d="M1 35h68v10H1Z" fill="#d3aa7e"/><path d="M34 37V-13m0 36L12 5m22 10L54-5" stroke="#739558" stroke-width="4"/><ellipse cx="18" cy="5" rx="17" ry="10" transform="rotate(32 18 5)" fill="#86a66a"/><ellipse cx="48" cy="-5" rx="17" ry="10" transform="rotate(-30 48 -5)" fill="#6c9259"/><ellipse cx="34" cy="-17" rx="10" ry="18" fill="#9ab779"/></g><g fill="#a2b783"><ellipse cx="769" cy="369" rx="51" ry="38"/><ellipse cx="794" cy="326" rx="34" ry="31"/><ellipse cx="755" cy="346" rx="32" ry="25"/></g><g fill="#e6dbab"><circle cx="751" cy="339" r="3"/><circle cx="775" cy="360" r="3"/><circle cx="772" cy="321" r="3"/></g><g fill="#f2edcb"><circle cx="168" cy="457" r="4"/><circle cx="171" cy="451" r="4"/><circle cx="175" cy="458" r="4"/><circle cx="638" cy="409" r="4"/><circle cx="643" cy="405" r="4"/><circle cx="645" cy="412" r="4"/></g><g fill="#b3a15f"><circle cx="171" cy="456" r="2.5"/><circle cx="642" cy="410" r="2.5"/></g><g fill="#e6e4ca" opacity=".85"><ellipse cx="212" cy="473" rx="10" ry="4"/><ellipse cx="229" cy="489" rx="8" ry="4"/><ellipse cx="672" cy="270" rx="9" ry="4"/></g></svg>`;
}
