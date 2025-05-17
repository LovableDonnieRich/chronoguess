
import React from "react";

export function Footer() {
  return (
    <footer className="bg-gray-100 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        <div className="flex justify-center space-x-4">
          <div dangerouslySetInnerHTML={{ 
            __html: `<a href="https://www.iubenda.com/privacy-policy/15893592" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe" title="Privacy Policy">Privacy Policy</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>`
          }} />
          <div dangerouslySetInnerHTML={{ 
            __html: `<a href="https://www.iubenda.com/privacy-policy/15893592/cookie-policy" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe" title="Cookie Policy">Cookie Policy</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>`
          }} />
        </div>
        <p className="mt-2">© {new Date().getFullYear()} ChronoGuess. All rights reserved.</p>
      </div>
    </footer>
  );
}
