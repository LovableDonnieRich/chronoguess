
import React from "react";

export function Footer() {
  return (
    <footer className="bg-white border-t-4 border-black py-4 mt-8 font-mono">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-8 text-sm uppercase">
          <div dangerouslySetInnerHTML={{ 
            __html: `<a href="https://www.iubenda.com/privacy-policy/15893592" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:underline" title="Privacy Policy">Privacy Policy</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>`
          }} />
          <div dangerouslySetInnerHTML={{ 
            __html: `<a href="https://www.iubenda.com/privacy-policy/15893592/cookie-policy" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:underline" title="Cookie Policy">Cookie Policy</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>`
          }} />
        </div>
        <p className="mt-4 text-xs text-black/70 uppercase tracking-tight">© {new Date().getFullYear()} ChronoGuess. All rights reserved.</p>
      </div>
    </footer>
  );
}
