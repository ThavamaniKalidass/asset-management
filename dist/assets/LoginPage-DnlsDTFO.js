import{c as i,u as w,r as a,j as e,m as t}from"./index-CNgtJ8Qn.js";/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=i("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=i("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=i("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=i("LogIn",[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=i("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);function C(){const{login:u}=w(),[l,b]=a.useState(()=>localStorage.getItem("ams_remember")||""),[n,p]=a.useState(""),[o,g]=a.useState(!1),[d,y]=a.useState(()=>!!localStorage.getItem("ams_remember")),[m,x]=a.useState(!1),[h,r]=a.useState(""),f=async s=>{if(s.preventDefault(),r(""),!l||!n){r("Please enter both email and password.");return}d?localStorage.setItem("ams_remember",l):localStorage.removeItem("ams_remember"),x(!0);try{await u(l,n)}catch(c){r((c==null?void 0:c.message)||"Invalid credentials. Please try again.")}x(!1)};return e.jsxs("div",{className:"relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4",children:[e.jsx("div",{className:"absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 animate-gradient-shift"}),e.jsx("div",{className:"absolute inset-0 bg-grid opacity-10"}),e.jsx("div",{className:"absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none"}),e.jsx("div",{className:"absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none"}),e.jsx("div",{className:"absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none"}),e.jsx(t.div,{initial:{opacity:0,y:30,scale:.98},animate:{opacity:1,y:0,scale:1},transition:{duration:.7,ease:[.4,0,.2,1]},className:"relative z-10 w-full max-w-md",children:e.jsxs("div",{className:"bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10",children:[e.jsxs(t.div,{initial:{opacity:0,y:-10},animate:{opacity:1,y:0},transition:{delay:.2,duration:.5},className:"flex flex-col items-center mb-8",children:[e.jsx("img",{src:"/smb-logo.png",alt:"Sustainable Medical Billing",className:"w-20 h-20 rounded-2xl shadow-lg shadow-green-500/30 mb-4 object-contain"}),e.jsx("h1",{className:"text-2xl font-bold text-white tracking-tight",children:"SMB"}),e.jsx("p",{className:"text-blue-200 text-sm mt-1",children:"Sustainable Medical Billing"})]}),e.jsxs(t.form,{initial:"hidden",animate:"visible",variants:{hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1,delayChildren:.3}}},onSubmit:f,className:"space-y-5",children:[h&&e.jsx(t.div,{initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},className:"bg-red-500/20 border border-red-400/30 text-red-200 text-sm rounded-xl px-4 py-3",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0",children:e.jsx("span",{className:"text-white text-xs font-bold",children:"!"})}),h]})}),e.jsxs(t.div,{variants:{hidden:{opacity:0,x:-20},visible:{opacity:1,x:0}},children:[e.jsx("label",{className:"block text-sm font-medium text-blue-100 mb-1.5",children:"Email Address"}),e.jsxs("div",{className:"relative",children:[e.jsx(S,{className:"absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300"}),e.jsx("input",{type:"email",value:l,onChange:s=>b(s.target.value),placeholder:"admin@company.com",autoComplete:"email",className:`w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/60 
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15
                             transition-all duration-200 text-sm`})]})]}),e.jsxs(t.div,{variants:{hidden:{opacity:0,x:-20},visible:{opacity:1,x:0}},children:[e.jsx("label",{className:"block text-sm font-medium text-blue-100 mb-1.5",children:"Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(N,{className:"absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300"}),e.jsx("input",{type:o?"text":"password",value:n,onChange:s=>p(s.target.value),placeholder:"••••••••",autoComplete:"current-password",className:`w-full pl-11 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/60 
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15
                             transition-all duration-200 text-sm`}),e.jsx("button",{type:"button",onClick:()=>g(!o),className:"absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors",tabIndex:-1,children:o?e.jsx(v,{className:"w-4 h-4"}):e.jsx(j,{className:"w-4 h-4"})})]})]}),e.jsxs(t.div,{variants:{hidden:{opacity:0,x:-20},visible:{opacity:1,x:0}},className:"flex items-center justify-between",children:[e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer select-none",children:[e.jsx("input",{type:"checkbox",checked:d,onChange:s=>y(s.target.checked),className:"w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400/50 focus:ring-offset-0 cursor-pointer"}),e.jsx("span",{className:"text-sm text-blue-100",children:"Remember me"})]}),e.jsx("button",{type:"button",className:"text-sm text-blue-200 hover:text-white transition-colors",children:"Forgot password?"})]}),e.jsx(t.div,{variants:{hidden:{opacity:0,y:10},visible:{opacity:1,y:0}},children:e.jsx("button",{type:"submit",disabled:m,className:`w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold
                           shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                           hover:from-blue-600 hover:to-indigo-700
                           active:scale-[0.98] transition-all duration-200
                           disabled:opacity-70 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 text-sm`,children:m?e.jsxs(e.Fragment,{children:[e.jsxs("svg",{className:"animate-spin w-5 h-5",fill:"none",viewBox:"0 0 24 24",children:[e.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),e.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"})]}),"Signing in..."]}):e.jsxs(e.Fragment,{children:[e.jsx(k,{className:"w-5 h-5"}),"Sign In"]})})})]}),e.jsx(t.div,{initial:{opacity:0},animate:{opacity:1},transition:{delay:1.2,duration:.5},className:"mt-6 pt-6 border-t border-white/10",children:e.jsxs("p",{className:"text-xs text-blue-200/70 text-center leading-relaxed",children:["Default credentials:"," ",e.jsx("span",{className:"text-blue-100 font-medium",children:"admin@company.com"})," / ",e.jsx("span",{className:"text-blue-100 font-medium",children:"admin123"})]})})]})}),e.jsx("style",{children:`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `})]})}export{C as default};
