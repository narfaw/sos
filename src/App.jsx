import { useState, useRef, useEffect } from "react";

const ADMIN_EMAIL = "admin@forum.com";

// Başlangıçta hiç fake mesaj/kullanıcı yok
const initialRooms = [
  { id: 1, name: "Genel Sohbet", description: "Her konudan özgürce konuş", icon: "💬", password: "", memberLimit: null, requiresName: false, posts: 0, members: 0 },
  { id: 2, name: "Teknoloji", description: "Tech haberleri ve tartışmalar", icon: "⚡", password: "", memberLimit: null, requiresName: false, posts: 0, members: 0 },
  { id: 3, name: "Oyun Dünyası", description: "Oyun tavsiyeleri ve yorumları", icon: "🎮", password: "oyun123", memberLimit: 20, requiresName: false, posts: 0, members: 0 },
  { id: 4, name: "Bilim & Felsefe", description: "Derin düşünceler için alan", icon: "🔬", password: "", memberLimit: null, requiresName: false, posts: 0, members: 0 },
];

const mockGoogleAuth = (email, password) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (!email.includes("@") || password.length < 6) {
      reject(new Error("Geçersiz email veya şifre çok kısa (min 6 karakter)"));
      return;
    }
    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    resolve({
      uid: btoa(email),
      email,
      displayName: name,
      avatar: name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase(),
      isAdmin: email === ADMIN_EMAIL,
      joinDate: new Date().toLocaleDateString("tr-TR"),
    });
  }, 1000);
});

const Icon = ({ name, size = 18 }) => {
  const icons = {
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    unlock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    message: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    heart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    crown: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M2 19h20v2H2zm1-3l3-8 4 4 2-6 2 6 4-4 3 8H3z"/></svg>,
    google: <svg width={size} height={size} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chat: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  };
  return icons[name] || null;
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#F8F7F4;--surface:#fff;--surface2:#F2F0EC;--border:#E8E5DF;--border2:#D5D1C8;--text:#1A1916;--text2:#6B6760;--text3:#9E9A93;--accent:#2D5016;--accent2:#4A8025;--accent-light:#EBF2E3;--red:#C0392B;--red-light:#FDECEA;--gold:#B8860B;--gold-light:#FFF8E7;--radius:12px;--shadow:0 2px 12px rgba(0,0,0,.08);--shadow-lg:0 8px 32px rgba(0,0,0,.12)}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
/* LOGIN */
.login-page{min-height:100vh;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}
.login-box{width:380px;padding:48px 40px 40px}
.login-logo{text-align:center;margin-bottom:40px}
.login-logo h1{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;letter-spacing:-.5px}
.login-logo span{color:var(--accent2)}
.login-logo p{font-size:13px;color:var(--text3);margin-top:4px}
.divider{display:flex;align-items:center;gap:12px;margin:22px 0}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border)}
.divider span{font-size:12px;color:var(--text3)}
.google-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 20px;border:1.5px solid var(--border2);border-radius:var(--radius);background:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s}
.google-btn:hover{border-color:var(--accent2);background:var(--accent-light)}
.input-group{margin-bottom:15px}
.input-group label{display:block;font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px;letter-spacing:.4px;text-transform:uppercase}
.input-wrap{position:relative}
.input-wrap input{width:100%;padding:12px 16px;border:1.5px solid var(--border);border-radius:var(--radius);font-family:'DM Sans',sans-serif;font-size:14px;color:var(--text);outline:none;transition:border-color .15s}
.input-wrap input:focus{border-color:var(--accent2)}
.input-wrap input.pt{padding-right:44px}
.tpw{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text3);display:flex;padding:2px}
.btn-p{width:100%;padding:13px;background:var(--accent);color:#fff;border:none;border-radius:var(--radius);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;margin-top:6px}
.btn-p:hover{background:var(--accent2)}
.btn-p:disabled{opacity:.55;cursor:not-allowed}
.err{padding:10px 14px;background:var(--red-light);border:1px solid #F5C6C2;border-radius:8px;font-size:13px;color:var(--red);margin-bottom:14px}
.suc{padding:10px 14px;background:var(--accent-light);border:1px solid #C3DFB0;border-radius:8px;font-size:13px;color:var(--accent);margin-bottom:14px}
.reg-link{position:fixed;bottom:24px;right:24px;font-size:13px;color:var(--text3)}
.reg-link button{background:none;border:none;color:var(--accent2);font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px}
.sp{width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;margin-right:7px;vertical-align:middle}
.spd{width:15px;height:15px;border:2px solid rgba(0,0,0,.12);border-top-color:#4285F4;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;margin-right:7px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
/* MODAL */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px)}
.mo{background:#fff;border-radius:16px;padding:32px;width:420px;max-width:92vw;box-shadow:var(--shadow-lg)}
.mo h2{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:8px}
.mo-foot{display:flex;gap:10px;margin-top:22px;justify-content:flex-end}
.btn-s{padding:10px 20px;background:none;border:1.5px solid var(--border2);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;color:var(--text2);transition:all .15s}
.btn-s:hover{border-color:var(--text2);color:var(--text)}
/* LAYOUT */
.layout{display:flex;min-height:100vh}
.sidebar{width:260px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;overflow-y:auto;z-index:50}
.sb-head{padding:22px 20px 14px;border-bottom:1px solid var(--border)}
.sb-logo{font-family:'Playfair Display',serif;font-size:20px;font-weight:700}
.sb-logo span{color:var(--accent2)}
.sb-user{display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--border)}
.av{width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.av.sm{width:28px;height:28px;font-size:10px}
.av.gold{background:var(--gold)}
.u-info{flex:1;min-width:0}
.u-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.u-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;background:var(--gold-light);color:var(--gold)}
.u-email{font-size:11px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-nav{padding:10px;flex:1}
.sec-lbl{font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;padding:0 10px;margin:12px 0 5px}
.ni{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;transition:all .12s;font-size:13.5px;font-weight:500;color:var(--text2);border:none;background:none;width:100%;text-align:left}
.ni:hover{background:var(--surface2);color:var(--text)}
.ni.act{background:var(--accent-light);color:var(--accent);font-weight:600}
.ni .ri{font-size:16px}
.ni .lk{margin-left:auto;color:var(--text3);opacity:.7}
.ni .pc{margin-left:auto;font-size:11px;color:var(--text3);background:var(--surface2);padding:1px 7px;border-radius:20px}
.sb-foot{padding:10px;border-top:1px solid var(--border)}
/* MAIN */
.main{margin-left:260px;flex:1;transition:margin-right .3s ease}
.main.co{margin-right:300px}
.topbar{position:sticky;top:0;z-index:100;background:rgba(248,247,244,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);padding:0 20px 0 32px;height:60px;display:flex;align-items:center;justify-content:space-between}
.tb-l{display:flex;align-items:center;gap:12px}
.tb-title{font-size:16px;font-weight:700}
.tb-sub{font-size:12px;color:var(--text3)}
.tb-r{display:flex;align-items:center;gap:8px}
.ib{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:none;background:none;cursor:pointer;border-radius:8px;color:var(--text2);transition:all .12s;position:relative}
.ib:hover{background:var(--surface2);color:var(--text)}
.ib.act{background:var(--accent-light);color:var(--accent)}
.chat-dot{position:absolute;top:5px;right:5px;width:8px;height:8px;background:var(--accent2);border-radius:50%;border:2px solid var(--bg)}
/* PAGE */
.pg{padding:32px;max-width:900px}
.banner{background:linear-gradient(135deg,var(--accent),var(--accent2));border-radius:16px;padding:28px 32px;color:#fff;margin-bottom:26px;position:relative;overflow:hidden}
.banner::after{content:'◆';position:absolute;right:24px;top:50%;transform:translateY(-50%);font-size:80px;opacity:.08}
.banner h2{font-family:'Playfair Display',serif;font-size:22px;margin-bottom:5px}
.banner p{font-size:14px;opacity:.85}
.stats{display:flex;gap:14px;margin-bottom:26px}
.sc{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px}
.sc .n{font-size:26px;font-weight:700;font-family:'Playfair Display',serif}
.sc .l{font-size:12px;color:var(--text3);margin-top:2px}
.sec-t{font-size:16px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.rc{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);padding:20px;cursor:pointer;transition:all .15s}
.rc:hover{border-color:var(--accent2);transform:translateY(-1px);box-shadow:var(--shadow)}
.rc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.rc h3{font-size:15px;font-weight:700;margin-bottom:4px}
.rc p{font-size:13px;color:var(--text3);line-height:1.4}
.rc-foot{display:flex;gap:14px;margin-top:13px;padding-top:11px;border-top:1px solid var(--border)}
.rm{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text3)}
/* ROOM */
.rv{display:flex;flex-direction:column;height:calc(100vh - 60px)}
.msgs{flex:1;overflow-y:auto;padding:24px 32px;display:flex;flex-direction:column;gap:16px}
.mi{display:flex;gap:12px}
.mb{flex:1}
.mh{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}
.ma{font-size:13.5px;font-weight:700}
.mt{font-size:11px;color:var(--text3)}
.mc{font-size:14px;line-height:1.6}
.mact{display:flex;gap:10px;margin-top:7px}
.mab{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text3);background:none;border:none;cursor:pointer;padding:3px 8px;border-radius:6px;transition:all .12s}
.mab:hover{background:var(--surface2)}
.mab.lk{color:var(--red)}
.ria{padding:16px 32px 22px;background:var(--surface);border-top:1px solid var(--border)}
.riw{display:flex;gap:10px;align-items:flex-end}
.ri{flex:1;padding:12px 16px;border:1.5px solid var(--border);border-radius:var(--radius);font-family:'DM Sans',sans-serif;font-size:14px;resize:none;outline:none;background:var(--bg);transition:border-color .15s;max-height:120px}
.ri:focus{border-color:var(--accent2);background:#fff}
.sb2{width:44px;height:44px;background:var(--accent);color:#fff;border:none;border-radius:var(--radius);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0}
.sb2:hover{background:var(--accent2)}
.sb2:disabled{opacity:.45;cursor:not-allowed}
.es{text-align:center;padding:60px 20px;color:var(--text3)}
.es .ei{font-size:44px;margin-bottom:10px}
.es p{font-size:14px}
/* ADMIN */
.ah{background:linear-gradient(135deg,#1A1916,#2D2C29);padding:28px 32px;color:#fff;margin-bottom:26px;border-radius:16px;display:flex;align-items:center;gap:16px}
.ah h2{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:2px}
.ah p{font-size:13px;opacity:.6}
.atabs{display:flex;gap:4px;margin-bottom:22px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:4px;width:fit-content}
.atab{padding:8px 20px;border:none;background:none;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;transition:all .12s}
.atab.act{background:var(--text);color:#fff;font-weight:600}
.ac{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:16px}
.ach{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.ach h3{font-size:15px;font-weight:700}
.rai{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border)}
.rai:last-child{border-bottom:none}
.rai-info{flex:1}
.rai-info h4{font-size:14px;font-weight:600;margin-bottom:2px}
.rai-acts{display:flex;gap:6px}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.badge.g{background:var(--accent-light);color:var(--accent)}
.badge.r{background:var(--red-light);color:var(--red)}
.badge.gr{background:var(--surface2);color:var(--text3)}
.fr{display:flex;gap:12px}
.fg{flex:1;margin-bottom:13px}
.fg label{display:block;font-size:11px;font-weight:700;color:var(--text2);margin-bottom:5px;text-transform:uppercase;letter-spacing:.3px}
.fg input,.fg select{width:100%;padding:10px 13px;border:1.5px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--text);background:#fff;outline:none;transition:border-color .15s}
.fg input:focus,.fg select:focus{border-color:var(--accent2)}
.cbl{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text2);cursor:pointer}
.cbl input{width:auto}
.bsm{padding:7px 14px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all .12s}
.bsm.g{background:var(--accent-light);color:var(--accent)}
.bsm.g:hover{background:var(--accent);color:#fff}
.bsm.r{background:var(--red-light);color:var(--red)}
.bsm.r:hover{background:var(--red);color:#fff}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;padding:9px 12px;border-bottom:1.5px solid var(--border)}
td{padding:12px;border-bottom:1px solid var(--border);font-size:13.5px}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--surface2)}
/* CHAT PANEL */
.cp{position:fixed;top:0;right:0;bottom:0;width:300px;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;z-index:200;transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:-4px 0 20px rgba(0,0,0,.07)}
.cp.open{transform:translateX(0)}
.cp-head{padding:0 16px;height:60px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.cp-title{font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px}
.on-dot{width:8px;height:8px;background:#22c55e;border-radius:50%}
.cm-list{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:11px}
.cm{display:flex;gap:8px;align-items:flex-start}
.cm.me{flex-direction:row-reverse}
.cb{max-width:200px;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.4;word-break:break-word;background:var(--surface2);color:var(--text)}
.cm.me .cb{background:var(--accent);color:#fff;border-radius:12px 12px 2px 12px}
.cm:not(.me) .cb{border-radius:12px 12px 12px 2px}
.cm-meta{font-size:10px;color:var(--text3);margin-top:3px}
.cm.me .cm-meta{text-align:right}
.cp-inp{padding:12px;border-top:1px solid var(--border);flex-shrink:0}
.cp-row{display:flex;gap:8px;align-items:flex-end}
.cp-ta{flex:1;padding:9px 12px;border:1.5px solid var(--border);border-radius:20px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;background:var(--bg);resize:none;max-height:80px;transition:border-color .15s}
.cp-ta:focus{border-color:var(--accent2);background:#fff}
.cp-sb{width:36px;height:36px;background:var(--accent);color:#fff;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}
.cp-sb:hover{background:var(--accent2)}
.cp-sb:disabled{opacity:.4;cursor:not-allowed}
.chat-fab{position:fixed;right:0;bottom:80px;z-index:199;background:var(--accent);color:#fff;border:none;width:46px;height:46px;border-radius:12px 0 0 12px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:-2px 2px 10px rgba(0,0,0,.15);transition:all .2s}
.chat-fab:hover{background:var(--accent2);width:50px}
.chat-fab.open{background:var(--surface2);color:var(--text2)}
`;

// ── Google Login Modal ─────────────────────────────────────────────────────────
function GoogleLoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!email || !pw) { setErr("Email ve şifre zorunludur."); return; }
    setErr(""); setLoading(true);
    try { await onLogin(email, pw); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h2 style={{ margin: 0 }}>Google ile Giriş</h2>
          <button className="ib" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 18, lineHeight: 1.5 }}>Google hesabınızın bilgilerini girin.</p>
        {err && <div className="err">{err}</div>}
        <div className="input-group">
          <label>Google Email</label>
          <div className="input-wrap"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@gmail.com" autoFocus /></div>
        </div>
        <div className="input-group">
          <label>Şifre</label>
          <div className="input-wrap">
            <input className="pt" type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="En az 6 karakter" />
            <button className="tpw" onClick={() => setShowPw(v => !v)}><Icon name={showPw ? "eyeOff" : "eye"} size={15} /></button>
          </div>
        </div>
        <button className="google-btn" onClick={submit} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? <span className="spd" /> : <Icon name="google" size={18} />}
          {loading ? "Bağlanıyor..." : "Giriş Yap"}
        </button>
      </div>
    </div>
  );
}

// ── Register Modal ─────────────────────────────────────────────────────────────
function RegisterModal({ onClose, onRegister }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false); const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const submit = async () => {
    setErr(""); setLoading(true);
    try { const user = await mockGoogleAuth(email, pw); onRegister(user); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  };
  return (
    <div className="ov" onClick={onClose}><div className="mo" onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Kayıt Ol</h2>
        <button className="ib" onClick={onClose}><Icon name="x" size={16} /></button>
      </div>
      <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 18, lineHeight: 1.5 }}>Google hesabınızla kayıt olun. Bilgileriniz otomatik kaydedilir.</p>
      {err && <div className="err">{err}</div>}
      <div className="input-group"><label>Google Email</label><div className="input-wrap"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@gmail.com" autoFocus /></div></div>
      <div className="input-group"><label>Şifre</label><div className="input-wrap">
        <input className="pt" type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="En az 6 karakter" />
        <button className="tpw" onClick={() => setShowPw(v => !v)}><Icon name={showPw ? "eyeOff" : "eye"} size={15} /></button>
      </div></div>
      <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 14 }}>Admin hesabı: <strong>admin@forum.com</strong></p>
      <button className="google-btn" onClick={submit} disabled={loading}>
        {loading ? <span className="spd" /> : <Icon name="google" size={18} />}
        {loading ? "Kaydediliyor..." : "Google ile Kayıt Ol"}
      </button>
    </div></div>
  );
}

// ── Room Password Modal ────────────────────────────────────────────────────────
function RoomPasswordModal({ room, onSuccess, onClose }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [showPw, setShowPw] = useState(false);
  const check = () => pw === room.password ? onSuccess() : setErr("Yanlış şifre.");
  return (
    <div className="ov" onClick={onClose}><div className="mo" onClick={e => e.stopPropagation()}>
      <h2>{room.icon} {room.name}</h2>
      <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 18 }}>Bu oda şifre korumalıdır.</p>
      {err && <div className="err">{err}</div>}
      <div className="input-group"><label>Oda Şifresi</label><div className="input-wrap">
        <input className="pt" type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && check()} placeholder="••••••••" autoFocus />
        <button className="tpw" onClick={() => setShowPw(v => !v)}><Icon name={showPw ? "eyeOff" : "eye"} size={15} /></button>
      </div></div>
      <div className="mo-foot">
        <button className="btn-s" onClick={onClose}>İptal</button>
        <button className="btn-p" style={{ width: "auto", marginTop: 0 }} onClick={check}>Giriş</button>
      </div>
    </div></div>
  );
}

// ── Room Name Modal ────────────────────────────────────────────────────────────
function RoomNameModal({ room, onSuccess, onClose }) {
  const [name, setName] = useState("");
  return (
    <div className="ov" onClick={onClose}><div className="mo" onClick={e => e.stopPropagation()}>
      <h2>{room.icon} {room.name}</h2>
      <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 18 }}>Bu odada görünen bir isim belirlemeniz gerekiyor.</p>
      <div className="input-group"><label>Görünen İsim</label><div className="input-wrap">
        <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && onSuccess(name.trim())} placeholder="İsminizi girin" autoFocus maxLength={30} />
      </div></div>
      <div className="mo-foot">
        <button className="btn-s" onClick={onClose}>İptal</button>
        <button className="btn-p" style={{ width: "auto", marginTop: 0 }} disabled={!name.trim()} onClick={() => onSuccess(name.trim())}>Devam</button>
      </div>
    </div></div>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false); const [err, setErr] = useState(""); const [suc, setSuc] = useState("");
  const [showReg, setShowReg] = useState(false); const [showGoog, setShowGoog] = useState(false);
  const [regUsers, setRegUsers] = useState([{ email: ADMIN_EMAIL }]);

  const login = async () => {
    setErr(""); setLoading(true);
    try {
      if (!regUsers.find(u => u.email === email)) throw new Error("Bu email kayıtlı değil. Önce kayıt olun.");
      const user = await mockGoogleAuth(email, pw);
      onLogin(user);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  const googleLogin = async (gEmail, gPw) => {
    if (!regUsers.find(u => u.email === gEmail)) throw new Error("Bu Google hesabı kayıtlı değil. Önce kayıt olun.");
    const user = await mockGoogleAuth(gEmail, gPw);
    setShowGoog(false);
    onLogin(user);
  };

  const register = (user) => {
    setRegUsers(prev => prev.find(u => u.email === user.email) ? prev : [...prev, user]);
    setShowReg(false); setEmail(user.email); setErr(""); setSuc("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
  };

  return (
    <div className="login-page">
      <style>{CSS}</style>
      {showReg && <RegisterModal onClose={() => setShowReg(false)} onRegister={register} />}
      {showGoog && <GoogleLoginModal onClose={() => setShowGoog(false)} onLogin={googleLogin} />}
      <div className="login-box">
        <div className="login-logo"><h1>Söz<span>yeri</span></h1><p>Topluluk forumuna hoş geldiniz</p></div>
        {err && <div className="err">{err}</div>}
        {suc && <div className="suc">{suc}</div>}
        <div className="input-group"><label>Email</label><div className="input-wrap">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="ornek@gmail.com" />
        </div></div>
        <div className="input-group"><label>Şifre</label><div className="input-wrap">
          <input className="pt" type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Şifrenizi girin" />
          <button className="tpw" onClick={() => setShowPw(v => !v)}><Icon name={showPw ? "eyeOff" : "eye"} size={15} /></button>
        </div></div>
        <button className="btn-p" onClick={login} disabled={loading || !email || !pw}>
          {loading && <span className="sp" />}{loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
        <div className="divider"><span>veya</span></div>
        <button className="google-btn" onClick={() => setShowGoog(true)}>
          <Icon name="google" size={18} />Google ile Giriş Yap
        </button>
      </div>
      <div className="reg-link">Hesabın yok mu? <button onClick={() => setShowReg(true)}>Kayıt Ol</button></div>
    </div>
  );
}

// ── Chat Panel ─────────────────────────────────────────────────────────────────
function ChatPanel({ open, onToggle, user }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const bottomRef = useRef(null);
  const now = () => { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };

  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = () => {
    if (!msg.trim()) return;
    setMessages(p => [...p, { id: Date.now(), author: user.displayName, avatar: user.avatar, text: msg.trim(), time: now(), mine: true }]);
    setMsg("");
  };

  return (
    <>
      <button className={`chat-fab ${open ? "open" : ""}`} onClick={onToggle} title="Canlı Chat">
        {open ? <Icon name="x" size={18} /> : <Icon name="chat" size={18} />}
      </button>
      <div className={`cp ${open ? "open" : ""}`}>
        <div className="cp-head">
          <div className="cp-title"><span className="on-dot" />Canlı Chat</div>
          <button className="ib" onClick={onToggle}><Icon name="x" size={15} /></button>
        </div>
        <div className="cm-list">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text3)", fontSize: 13 }}>
              Henüz mesaj yok.<br />İlk sen başlat!
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`cm ${m.mine ? "me" : ""}`}>
              {!m.mine && <div className="av sm" style={{ flexShrink: 0 }}>{m.avatar}</div>}
              <div>
                {!m.mine && <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", marginBottom: 3 }}>{m.author}</div>}
                <div className="cb">{m.text}</div>
                <div className="cm-meta">{m.time}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="cp-inp"><div className="cp-row">
          <textarea className="cp-ta" value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Mesaj yaz..." rows={1} />
          <button className="cp-sb" onClick={send} disabled={!msg.trim()}><Icon name="send" size={14} /></button>
        </div></div>
      </div>
    </>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function Dashboard({ user, rooms, onEnterRoom }) {
  return (
    <div className="pg">
      <div className="banner"><h2>Hoş geldin, {user.displayName.split(" ")[0]}! 👋</h2><p>Bugün hangi odada sohbet etmek istersin?</p></div>
      <div className="stats">
        <div className="sc"><div className="n">{rooms.length}</div><div className="l">Aktif Oda</div></div>
        <div className="sc"><div className="n">{rooms.reduce((a, r) => a + r.posts, 0)}</div><div className="l">Toplam Gönderi</div></div>
        <div className="sc"><div className="n">{rooms.reduce((a, r) => a + r.members, 0)}</div><div className="l">Toplam Üye</div></div>
      </div>
      <div className="sec-t"><Icon name="message" size={16} />Odalar</div>
      <div className="grid">
        {rooms.map(room => (
          <div className="rc" key={room.id} onClick={() => onEnterRoom(room)}>
            <div className="rc-top"><span style={{ fontSize: 24 }}>{room.icon}</span>{room.password && <span style={{ color: "var(--text3)" }}><Icon name="lock" size={14} /></span>}</div>
            <h3>{room.name}</h3><p>{room.description}</p>
            <div className="rc-foot">
              <span className="rm"><Icon name="message" size={12} />{room.posts} gönderi</span>
              <span className="rm"><Icon name="users" size={12} />{room.memberLimit ? `${room.members}/${room.memberLimit}` : room.members} üye</span>
              {room.requiresName && <span className="rm" style={{ color: "var(--accent2)", fontWeight: 600 }}>İsim gerekli</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Room View ──────────────────────────────────────────────────────────────────
function RoomView({ room, user, posts, onPost, displayName }) {
  const [msg, setMsg] = useState(""); const [liked, setLiked] = useState({}); const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [posts]);
  const send = () => {
    if (!msg.trim()) return;
    const name = displayName || user.displayName;
    onPost(room.id, { content: msg.trim(), author: name, avatar: name.substring(0, 2).toUpperCase() });
    setMsg("");
  };
  return (
    <div className="rv">
      <div className="msgs">
        {posts.length === 0 && <div className="es"><div className="ei">💬</div><p>Henüz mesaj yok. İlk sen yaz!</p></div>}
        {posts.map(p => (
          <div className="mi" key={p.id}>
            <div className="av sm">{p.avatar}</div>
            <div className="mb">
              <div className="mh"><span className="ma">{p.author}</span><span className="mt">{p.time}</span></div>
              <div className="mc">{p.content}</div>
              <div className="mact">
                <button className={`mab ${liked[p.id] ? "lk" : ""}`} onClick={() => setLiked(v => ({ ...v, [p.id]: !v[p.id] }))}>
                  <Icon name="heart" size={12} /> {p.likes + (liked[p.id] ? 1 : 0)}
                </button>
              </div>
            </div>
          </div>
        ))}
        <div ref={ref} />
      </div>
      <div className="ria"><div className="riw">
        <textarea className="ri" value={msg} onChange={e => setMsg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Mesaj yaz... (Enter ile gönder)" rows={1} />
        <button className="sb2" onClick={send} disabled={!msg.trim()}><Icon name="send" size={16} /></button>
      </div></div>
    </div>
  );
}

// ── Admin Panel ────────────────────────────────────────────────────────────────
function AdminPanel({ rooms, setRooms, users }) {
  const [tab, setTab] = useState("rooms");
  const [editRoom, setEditRoom] = useState(null); const [editData, setEditData] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", description: "", icon: "💬", password: "", memberLimit: "", requiresName: false });

  const startEdit = r => { setEditRoom(r.id); setEditData({ ...r }); };
  const saveEdit = () => { setRooms(rs => rs.map(r => r.id === editRoom ? { ...r, ...editData, memberLimit: editData.memberLimit === "" ? null : Number(editData.memberLimit) } : r)); setEditRoom(null); };
  const del = id => setRooms(rs => rs.filter(r => r.id !== id));
  const add = () => {
    if (!newRoom.name.trim()) return;
    setRooms(rs => [...rs, { ...newRoom, id: Date.now(), memberLimit: newRoom.memberLimit === "" ? null : Number(newRoom.memberLimit), posts: 0, members: 0 }]);
    setNewRoom({ name: "", description: "", icon: "💬", password: "", memberLimit: "", requiresName: false }); setShowNew(false);
  };

  return (
    <div className="pg">
      <div className="ah"><div style={{ opacity: .9 }}><Icon name="shield" size={30} /></div><div><h2>Admin Paneli</h2><p>Forum yönetimi</p></div></div>
      <div className="atabs">
        {[["rooms","Odalar"],["users","Kullanıcılar"]].map(([k,l]) => (
          <button key={k} className={`atab ${tab===k?"act":""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "rooms" && <div className="ac">
        <div className="ach"><h3>Odalar ({rooms.length})</h3>
          <button className="bsm g" onClick={() => setShowNew(v => !v)} style={{ display:"flex",alignItems:"center",gap:5 }}><Icon name="plus" size={12} />Yeni Oda</button>
        </div>
        {showNew && <div style={{ background:"var(--surface2)",borderRadius:10,padding:18,marginBottom:18 }}>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:12 }}>Yeni Oda</div>
          <div className="fr">
            <div className="fg"><label>Oda Adı</label><input value={newRoom.name} onChange={e => setNewRoom(p=>({...p,name:e.target.value}))} placeholder="Oda adı" /></div>
            <div className="fg" style={{ flex:.3 }}><label>İkon</label><input value={newRoom.icon} onChange={e => setNewRoom(p=>({...p,icon:e.target.value}))} maxLength={2} /></div>
          </div>
          <div className="fg"><label>Açıklama</label><input value={newRoom.description} onChange={e => setNewRoom(p=>({...p,description:e.target.value}))} placeholder="Açıklama" /></div>
          <div className="fr">
            <div className="fg"><label>Şifre</label><input value={newRoom.password} onChange={e => setNewRoom(p=>({...p,password:e.target.value}))} placeholder="Boş = şifresiz" /></div>
            <div className="fg"><label>Üye Limiti</label><input type="number" value={newRoom.memberLimit} onChange={e => setNewRoom(p=>({...p,memberLimit:e.target.value}))} placeholder="Boş = sınırsız" /></div>
          </div>
          <label className="cbl" style={{ marginBottom:14 }}><input type="checkbox" checked={newRoom.requiresName} onChange={e => setNewRoom(p=>({...p,requiresName:e.target.checked}))} />İsim zorunlu</label>
          <div style={{ display:"flex",gap:8 }}>
            <button className="bsm g" onClick={add}>Ekle</button>
            <button className="bsm" style={{ background:"var(--surface)",border:"1.5px solid var(--border)" }} onClick={() => setShowNew(false)}>İptal</button>
          </div>
        </div>}
        {rooms.map(room => (
          <div className="rai" key={room.id}>
            {editRoom === room.id ? <div style={{ flex:1 }}>
              <div className="fr">
                <div className="fg"><label>Ad</label><input value={editData.name} onChange={e => setEditData(p=>({...p,name:e.target.value}))} /></div>
                <div className="fg" style={{ flex:.3 }}><label>İkon</label><input value={editData.icon} onChange={e => setEditData(p=>({...p,icon:e.target.value}))} maxLength={2} /></div>
              </div>
              <div className="fr">
                <div className="fg"><label>Şifre</label><input value={editData.password} onChange={e => setEditData(p=>({...p,password:e.target.value}))} placeholder="Şifresiz" /></div>
                <div className="fg"><label>Üye Limiti</label><input type="number" value={editData.memberLimit||""} onChange={e => setEditData(p=>({...p,memberLimit:e.target.value}))} placeholder="Sınırsız" /></div>
              </div>
              <label className="cbl" style={{ marginBottom:12 }}><input type="checkbox" checked={editData.requiresName} onChange={e => setEditData(p=>({...p,requiresName:e.target.checked}))} />İsim zorunlu</label>
              <div style={{ display:"flex",gap:6 }}>
                <button className="bsm g" onClick={saveEdit}>Kaydet</button>
                <button className="bsm" style={{ background:"var(--surface)",border:"1.5px solid var(--border)" }} onClick={() => setEditRoom(null)}>İptal</button>
              </div>
            </div> : <>
              <span style={{ fontSize:22 }}>{room.icon}</span>
              <div className="rai-info"><h4>{room.name}</h4>
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginTop:4 }}>
                  {room.password ? <span className="badge r"><Icon name="lock" size={10} />Şifreli</span> : <span className="badge g"><Icon name="unlock" size={10} />Açık</span>}
                  {room.memberLimit && <span className="badge gr"><Icon name="users" size={10} />Maks {room.memberLimit}</span>}
                  {room.requiresName && <span className="badge gr">İsim gerekli</span>}
                </div>
              </div>
              <div className="rai-acts">
                <button className="bsm g" onClick={() => startEdit(room)}><Icon name="edit" size={11} /></button>
                <button className="bsm r" onClick={() => del(room.id)}><Icon name="trash" size={11} /></button>
              </div>
            </>}
          </div>
        ))}
      </div>}
      {tab === "users" && <div className="ac">
        <div className="ach"><h3>Kullanıcılar ({users.length})</h3></div>
        <table>
          <thead><tr><th>Kullanıcı</th><th>Email</th><th>Kayıt Tarihi</th><th>Rol</th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.uid}>
              <td><div style={{ display:"flex",alignItems:"center",gap:10 }}><div className={`av sm ${u.isAdmin?"gold":""}`}>{u.avatar}</div>{u.displayName}</div></td>
              <td style={{ color:"var(--text2)" }}>{u.email}</td>
              <td style={{ color:"var(--text3)",fontSize:12 }}>{u.joinDate}</td>
              <td>{u.isAdmin ? <span className="badge" style={{ background:"var(--gold-light)",color:"var(--gold)" }}><Icon name="crown" size={10} />Admin</span> : <span className="badge gr">Üye</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState(initialRooms);
  const [posts, setPosts] = useState({});
  const [view, setView] = useState("dashboard");
  const [activeRoom, setActiveRoom] = useState(null);
  const [pendingRoom, setPendingRoom] = useState(null);
  const [roomModal, setRoomModal] = useState(null);
  const [roomNames, setRoomNames] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);

  const login = u => { setUser(u); setAllUsers(p => p.find(x => x.uid === u.uid) ? p : [...p, u]); };

  const enterRoom = room => {
    if (room.memberLimit && room.members >= room.memberLimit && !user.isAdmin) { alert("Bu oda dolu!"); return; }
    setPendingRoom(room);
    if (room.password && !user.isAdmin) setRoomModal("password");
    else if (room.requiresName && !roomNames[room.id]) setRoomModal("name");
    else openRoom(room);
  };

  const openRoom = (room, displayName) => {
    if (displayName) setRoomNames(p => ({ ...p, [room.id]: displayName }));
    if (!posts[room.id]) setPosts(p => ({ ...p, [room.id]: [] }));
    setActiveRoom(room); setView("room"); setRoomModal(null); setPendingRoom(null);
  };

  const addPost = (roomId, data) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setPosts(p => ({ ...p, [roomId]: [...(p[roomId]||[]), { id: Date.now(), ...data, time, likes: 0 }] }));
    setRooms(rs => rs.map(r => r.id === roomId ? { ...r, posts: r.posts + 1 } : r));
  };

  if (!user) return <LoginPage onLogin={login} />;
  const curRoom = rooms.find(r => r.id === activeRoom?.id);

  return (
    <>
      <style>{CSS}</style>
      {roomModal === "password" && pendingRoom && (
        <RoomPasswordModal room={pendingRoom}
          onSuccess={() => pendingRoom.requiresName && !roomNames[pendingRoom.id] ? setRoomModal("name") : openRoom(pendingRoom)}
          onClose={() => { setRoomModal(null); setPendingRoom(null); }} />
      )}
      {roomModal === "name" && pendingRoom && (
        <RoomNameModal room={pendingRoom} onSuccess={name => openRoom(pendingRoom, name)} onClose={() => { setRoomModal(null); setPendingRoom(null); }} />
      )}
      <div className="layout">
        <aside className="sidebar">
          <div className="sb-head"><div className="sb-logo">Söz<span>yeri</span></div></div>
          <div className="sb-user">
            <div className={`av ${user.isAdmin?"gold":""}`}>{user.avatar}</div>
            <div className="u-info">
              <div className="u-name">{user.displayName}</div>
              {user.isAdmin ? <div className="u-badge"><Icon name="crown" size={9} />Admin</div> : <div className="u-email">{user.email}</div>}
            </div>
          </div>
          <nav className="sb-nav">
            <button className={`ni ${view==="dashboard"?"act":""}`} onClick={() => setView("dashboard")}><Icon name="bell" size={15} />Anasayfa</button>
            {user.isAdmin && <button className={`ni ${view==="admin"?"act":""}`} onClick={() => setView("admin")}><Icon name="shield" size={15} />Admin Paneli</button>}
            <div className="sec-lbl">Odalar</div>
            {rooms.map(r => (
              <button key={r.id} className={`ni ${view==="room"&&activeRoom?.id===r.id?"act":""}`} onClick={() => enterRoom(r)}>
                <span className="ri">{r.icon}</span>{r.name}
                {r.password ? <span className="lk"><Icon name="lock" size={11} /></span> : <span className="pc">{r.posts}</span>}
              </button>
            ))}
          </nav>
          <div className="sb-foot"><button className="ni" onClick={() => setUser(null)}><Icon name="logout" size={15} />Çıkış Yap</button></div>
        </aside>
        <main className={`main ${chatOpen?"co":""}`}>
          <header className="topbar">
            <div className="tb-l">
              {view==="room" && <button className="ib" onClick={() => setView("dashboard")}><Icon name="back" size={16} /></button>}
              <div>
                <div className="tb-title">{view==="dashboard"?"Anasayfa":view==="admin"?"Admin Paneli":curRoom?`${curRoom.icon} ${curRoom.name}`:""}</div>
                {view==="room"&&curRoom && <div className="tb-sub">{curRoom.description}</div>}
              </div>
            </div>
            <div className="tb-r">
              <button className={`ib ${chatOpen?"act":""}`} onClick={() => setChatOpen(v=>!v)} title="Canlı Chat">
                <Icon name="chat" size={16} />
                {!chatOpen && <span className="chat-dot" />}
              </button>
              <div className={`av sm ${user.isAdmin?"gold":""}`}>{user.avatar}</div>
            </div>
          </header>
          {view==="dashboard" && <Dashboard user={user} rooms={rooms} onEnterRoom={enterRoom} />}
          {view==="admin" && user.isAdmin && <AdminPanel rooms={rooms} setRooms={setRooms} users={allUsers} />}
          {view==="room" && curRoom && <RoomView room={curRoom} user={user} posts={posts[curRoom.id]||[]} onPost={addPost} displayName={roomNames[curRoom.id]} />}
        </main>
        <ChatPanel open={chatOpen} onToggle={() => setChatOpen(v=>!v)} user={user} />
      </div>
    </>
  );
}
